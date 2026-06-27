from django.contrib.auth.models import AbstractUser
from django.db import models

DEFAULT_NOTIFICATION_SETTINGS = {
    'emailAlerts': True,
    'pushAlerts': True,
    'jobMatches': True,
    'chatMessages': True,
    'marketing': False,
}


def default_notification_settings() -> dict:
    return dict(DEFAULT_NOTIFICATION_SETTINGS)


class User(AbstractUser):
    class Role(models.TextChoices):
        SEEKER = 'seeker', 'Seeker'
        POSTER = 'poster', 'Poster'
        ADMIN = 'admin', 'Admin'

    class ProfileRole(models.TextChoices):
        SEEKER = 'seeker', 'Seeker'
        POSTER = 'poster', 'Poster'
        BOTH = 'both', 'Both'

    class Language(models.TextChoices):
        EN = 'en', 'English'
        UZ = 'uz', 'Uzbek'
        RU = 'ru', 'Russian'

    role = models.CharField(max_length=16, choices=Role.choices, default=Role.SEEKER)
    profile_role = models.CharField(
        max_length=16, choices=ProfileRole.choices, default=ProfileRole.BOTH
    )
    phone = models.CharField(max_length=32, blank=True)
    title = models.CharField(max_length=120, blank=True)
    avatar_url = models.URLField(blank=True)
    language = models.CharField(max_length=8, choices=Language.choices, default=Language.UZ)
    badge = models.CharField(max_length=64, blank=True)
    company_id = models.CharField(max_length=64, blank=True)
    notifications = models.JSONField(default=default_notification_settings, blank=True)
    blocked = models.BooleanField(default=False)
    # Last-known coordinates power "jobs near me" defaults across sessions.
    last_lat = models.FloatField(null=True, blank=True)
    last_lng = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['blocked']),
        ]

    @property
    def display_name(self) -> str:
        return self.get_full_name().strip() or self.username

    def merged_notifications(self) -> dict:
        merged = dict(DEFAULT_NOTIFICATION_SETTINGS)
        if isinstance(self.notifications, dict):
            merged.update(self.notifications)
        return merged
