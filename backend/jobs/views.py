from django.db.models import Count, Exists, F, OuterRef
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from .filters import JobFilter
from .geo import filter_nearby
from .models import Category, Job, Location
from .serializers import CategorySerializer, JobSerializer, LocationSerializer

TRUE_VALUES = {'1', 'true', 'yes', 'on'}
DEFAULT_RADIUS_KM = 25.0
MAX_RADIUS_KM = 300.0


class IsOwnerOrAdminOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if not request.user.is_authenticated:
            return False
        if getattr(request.user, 'role', None) == 'admin':
            return True
        return getattr(obj, 'poster_id', None) == request.user.id


def parse_near(params):
    """Parse `?near=lat,lng` or `?lat=&lng=` plus `?radius_km=`. Returns (lat, lng, radius) or None."""
    lat = lng = None
    near = params.get('near')
    if near:
        try:
            lat_str, lng_str = near.split(',')
            lat, lng = float(lat_str), float(lng_str)
        except (ValueError, TypeError):
            raise ValidationError({'near': 'Expected format: near=<lat>,<lng>'})
    elif params.get('lat') and params.get('lng'):
        try:
            lat, lng = float(params['lat']), float(params['lng'])
        except (ValueError, TypeError):
            raise ValidationError({'lat': 'lat and lng must be numbers'})
    if lat is None or lng is None:
        return None
    if not (-90 <= lat <= 90 and -180 <= lng <= 180):
        raise ValidationError({'near': 'Coordinates out of range'})
    try:
        radius = float(params.get('radius_km', DEFAULT_RADIUS_KM))
    except (ValueError, TypeError):
        radius = DEFAULT_RADIUS_KM
    radius = max(0.5, min(radius, MAX_RADIUS_KM))
    return lat, lng, radius


class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    permission_classes = (IsOwnerOrAdminOrReadOnly,)
    filterset_class = JobFilter
    search_fields = ('title', 'company_name', 'description', 'skills', 'location_label')
    ordering_fields = ('created_at', 'salary_min', 'salary_max', 'views_count')
    ordering = ('-created_at',)

    def get_queryset(self):
        qs = Job.objects.select_related('category', 'poster')
        user = self.request.user
        params = self.request.query_params
        is_admin = user.is_authenticated and getattr(user, 'role', None) == 'admin'
        mine = params.get('mine', '').lower() in TRUE_VALUES
        poster_param = params.get('poster')
        owns = user.is_authenticated and poster_param and str(user.id) == str(poster_param)

        if self.action in ('update', 'partial_update', 'destroy'):
            # Object-level permission handles ownership; don't hide drafts here.
            pass
        elif is_admin:
            pass
        elif mine and user.is_authenticated:
            qs = qs.filter(poster=user)
        elif owns:
            qs = qs.filter(poster=user)
        else:
            qs = qs.filter(status=Job.Status.ACTIVE)

        if user.is_authenticated:
            from social.models import Favorite

            qs = qs.annotate(
                is_favorited=Exists(Favorite.objects.filter(user=user, job=OuterRef('pk')))
            )

        near = parse_near(params)
        self._near_active = bool(near)
        if near:
            lat, lng, radius = near
            qs = filter_nearby(qs, lat, lng, radius)
        return qs

    def filter_queryset(self, queryset):
        # Preserve nearest-first ordering from a geo search unless the client
        # asked for an explicit `ordering` — otherwise OrderingFilter would
        # re-apply the default `-created_at` and clobber the distance sort.
        if getattr(self, '_near_active', False) and 'ordering' not in self.request.query_params:
            self.ordering = None
        return super().filter_queryset(queryset)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Atomic, race-free view counter; don't count the owner's own views.
        if not (request.user.is_authenticated and request.user.id == instance.poster_id):
            Job.objects.filter(pk=instance.pk).update(views_count=F('views_count') + 1)
            instance.views_count += 1
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        qs = self.filter_queryset(self.get_queryset()).filter(is_featured=True)[:12]
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def mine(self, request):
        if not request.user.is_authenticated:
            return Response([], status=200)
        qs = Job.objects.filter(poster=request.user).select_related('category', 'poster')
        page = self.paginate_queryset(qs)
        serializer = self.get_serializer(page if page is not None else qs, many=True)
        return self.get_paginated_response(serializer.data) if page is not None else Response(serializer.data)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = None

    def get_queryset(self):
        return Category.objects.annotate(
            job_count_annotated=Count('jobs', filter=models_active_filter())
        )


class LocationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LocationSerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = None

    def get_queryset(self):
        return Location.objects.filter(is_active=True)


def models_active_filter():
    from django.db.models import Q

    return Q(jobs__status=Job.Status.ACTIVE)
