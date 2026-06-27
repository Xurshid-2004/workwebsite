from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ApplicationViewSet,
    ChatViewSet,
    FavoriteViewSet,
    NotificationViewSet,
    ReportViewSet,
)

router = DefaultRouter()
router.register('favorites', FavoriteViewSet, basename='favorites')
router.register('chats', ChatViewSet, basename='chats')
router.register('applications', ApplicationViewSet, basename='applications')
router.register('notifications', NotificationViewSet, basename='notifications')
router.register('reports', ReportViewSet, basename='reports')

urlpatterns = [
    path('', include(router.urls)),
]
