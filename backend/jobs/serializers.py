from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from .models import Category, Job, Location


class CategorySerializer(serializers.ModelSerializer):
    # Annotated in the viewset queryset; falls back to a live count.
    job_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'icon', 'order', 'job_count')

    def get_job_count(self, obj: Category) -> int:
        annotated = getattr(obj, 'job_count_annotated', None)
        if annotated is not None:
            return annotated
        return obj.jobs.filter(status=Job.Status.ACTIVE).count()


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ('id', 'label', 'slug', 'region', 'is_remote', 'is_active', 'lat', 'lng')


class JobLocationField(serializers.Serializer):
    """Nested {label, is_remote, lat, lng, city, country} contract for the job payload."""

    label = serializers.CharField(required=False, allow_blank=True)
    is_remote = serializers.BooleanField(required=False)
    lat = serializers.FloatField(required=False, allow_null=True)
    lng = serializers.FloatField(required=False, allow_null=True)
    city = serializers.CharField(required=False, allow_blank=True)
    country = serializers.CharField(required=False, allow_blank=True)


class JobSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        source='category', queryset=Category.objects.all()
    )
    poster_id = serializers.IntegerField(source='poster.id', read_only=True)
    poster_name = serializers.CharField(source='poster.display_name', read_only=True)
    location = serializers.SerializerMethodField()
    location_input = JobLocationField(write_only=True, required=False)
    distance = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = (
            'id',
            'title',
            'company_id',
            'company_name',
            'company_logo',
            'category_id',
            'poster_id',
            'poster_name',
            'description',
            'requirements',
            'responsibilities',
            'status',
            'work_type',
            'schedule_type',
            'schedule_pattern',
            'location',
            'location_input',
            'salary_min',
            'salary_max',
            'salary_currency',
            'skills',
            'is_featured',
            'contact_phone',
            'address',
            'district',
            'views_count',
            'distance',
            'is_favorited',
            'created_at',
            'updated_at',
        )
        read_only_fields = (
            'id',
            'poster_id',
            'poster_name',
            'views_count',
            'distance',
            'is_favorited',
            'created_at',
            'updated_at',
        )

    def get_location(self, obj: Job) -> dict:
        return {
            'label': obj.location_label,
            'city': obj.location_city,
            'country': obj.location_country,
            'is_remote': obj.location_is_remote,
            'lat': obj.location_lat,
            'lng': obj.location_lng,
        }

    @extend_schema_field(OpenApiTypes.FLOAT)
    def get_distance(self, obj: Job):
        distance = getattr(obj, 'distance', None)
        return round(distance, 2) if distance is not None else None

    def get_is_favorited(self, obj: Job) -> bool:
        favorited = getattr(obj, 'is_favorited', None)
        if favorited is not None:
            return bool(favorited)
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.favorited_by.filter(user=request.user).exists()

    def _apply_location(self, instance_data: dict, payload, partial: bool):
        if payload is None:
            # Accept the read-shaped `location` key on write too, for convenience.
            payload = self.initial_data.get('location')
        if not isinstance(payload, dict):
            return
        mapping = {
            'location_label': payload.get('label'),
            'location_city': payload.get('city'),
            'location_country': payload.get('country'),
            'location_is_remote': payload.get('is_remote'),
            'location_lat': payload.get('lat'),
            'location_lng': payload.get('lng'),
        }
        for key, value in mapping.items():
            if value is not None or not partial:
                instance_data[key] = value if value is not None else instance_data.get(key)

    def create(self, validated_data):
        payload = validated_data.pop('location_input', None)
        self._apply_location(validated_data, payload, partial=False)
        validated_data.setdefault('location_country', 'Uzbekistan')
        validated_data['poster'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        payload = validated_data.pop('location_input', None)
        location = {}
        self._apply_location(location, payload, partial=True)
        for key, value in location.items():
            setattr(instance, key, value)
        return super().update(instance, validated_data)
