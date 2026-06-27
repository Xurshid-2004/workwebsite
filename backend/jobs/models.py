from django.conf import settings
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(unique=True)
    icon = models.CharField(max_length=64, blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ('order', 'name')
        verbose_name_plural = 'categories'

    def __str__(self) -> str:
        return self.name


class Location(models.Model):
    """Reference list of cities / districts used for filters and map centering."""

    label = models.CharField(max_length=120)
    slug = models.SlugField(unique=True)
    region = models.CharField(max_length=120, blank=True)
    is_remote = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ('label',)

    def __str__(self) -> str:
        return self.label


class Job(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PENDING = 'pending', 'Pending'
        ACTIVE = 'active', 'Active'
        CLOSED = 'closed', 'Closed'

    # Aligned with the frontend WorkType union: remote | onsite | hybrid.
    class WorkType(models.TextChoices):
        REMOTE = 'remote', 'Remote'
        ONSITE = 'onsite', 'On-site'
        HYBRID = 'hybrid', 'Hybrid'

    # Aligned with the frontend ScheduleType union.
    class ScheduleType(models.TextChoices):
        FULL_TIME = 'full-time', 'Full-time'
        PART_TIME = 'part-time', 'Part-time'
        FREELANCE = 'freelance', 'Freelance'
        CONTRACT = 'contract', 'Contract'

    # Aligned with the frontend ScheduleFilter union (hours pattern).
    class SchedulePattern(models.TextChoices):
        STANDARD = 'standard', 'Standard'
        FLEXIBLE_HOURS = 'flexible-hours', 'Flexible hours'
        WEEKENDS = 'weekends', 'Weekends'
        NIGHT_SHIFT = 'night-shift', 'Night shift'

    title = models.CharField(max_length=200)
    company_id = models.CharField(max_length=64, blank=True)
    company_name = models.CharField(max_length=160)
    company_logo = models.URLField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='jobs')
    poster = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='jobs'
    )
    description = models.TextField()
    requirements = models.JSONField(default=list, blank=True)
    responsibilities = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    work_type = models.CharField(max_length=16, choices=WorkType.choices, default=WorkType.ONSITE)
    schedule_type = models.CharField(
        max_length=16, choices=ScheduleType.choices, default=ScheduleType.FULL_TIME
    )
    schedule_pattern = models.CharField(
        max_length=16, choices=SchedulePattern.choices, default=SchedulePattern.STANDARD
    )

    # Embedded location (denormalized for fast list/map reads).
    location_label = models.CharField(max_length=160)
    location_city = models.CharField(max_length=120, blank=True)
    location_country = models.CharField(max_length=120, blank=True, default='Uzbekistan')
    location_is_remote = models.BooleanField(default=False)
    location_lat = models.FloatField(null=True, blank=True)
    location_lng = models.FloatField(null=True, blank=True)

    salary_min = models.PositiveIntegerField(default=0)
    salary_max = models.PositiveIntegerField(default=0)
    salary_currency = models.CharField(max_length=8, default='USD')
    skills = models.JSONField(default=list, blank=True)
    is_featured = models.BooleanField(default=False)
    contact_phone = models.CharField(max_length=32, blank=True)
    address = models.CharField(max_length=255, blank=True)
    district = models.CharField(max_length=120, blank=True)

    views_count = models.PositiveIntegerField(default=0)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-created_at',)
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['is_featured']),
            models.Index(fields=['category']),
            models.Index(fields=['work_type']),
            # Bounding-box geo pre-filter scans these first.
            models.Index(fields=['location_lat', 'location_lng']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self) -> str:
        return self.title
