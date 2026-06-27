from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, JobViewSet, LocationViewSet

router = DefaultRouter()
router.register('jobs', JobViewSet, basename='jobs')
router.register('categories', CategoryViewSet, basename='categories')
router.register('locations', LocationViewSet, basename='locations')

urlpatterns = [
    path('', include(router.urls)),
]
