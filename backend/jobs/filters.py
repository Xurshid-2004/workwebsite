from django_filters import rest_framework as filters

from .models import Job


class JobFilter(filters.FilterSet):
    """Rich filtering for the jobs list — drives search, filters and the map."""

    category = filters.NumberFilter(field_name='category_id')
    category_slug = filters.CharFilter(field_name='category__slug', lookup_expr='iexact')
    work_type = filters.CharFilter(field_name='work_type', lookup_expr='iexact')
    schedule_type = filters.CharFilter(field_name='schedule_type', lookup_expr='iexact')
    schedule_pattern = filters.CharFilter(field_name='schedule_pattern', lookup_expr='iexact')
    is_remote = filters.BooleanFilter(field_name='location_is_remote')
    is_featured = filters.BooleanFilter(field_name='is_featured')
    status = filters.CharFilter(field_name='status', lookup_expr='iexact')
    salary_min = filters.NumberFilter(field_name='salary_max', lookup_expr='gte')
    salary_max = filters.NumberFilter(field_name='salary_min', lookup_expr='lte')
    location = filters.CharFilter(method='filter_location')
    poster = filters.NumberFilter(field_name='poster_id')

    class Meta:
        model = Job
        fields = (
            'category',
            'category_slug',
            'work_type',
            'schedule_type',
            'schedule_pattern',
            'is_remote',
            'is_featured',
            'status',
            'salary_min',
            'salary_max',
            'location',
            'poster',
        )

    def filter_location(self, queryset, name, value):
        from django.db.models import Q

        return queryset.filter(
            Q(location_label__icontains=value)
            | Q(location_city__icontains=value)
            | Q(district__icontains=value)
        )
