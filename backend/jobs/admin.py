from django.contrib import admin

from .models import Category, Job, Location


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'order')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('label', 'region', 'is_remote', 'is_active')
    list_filter = ('region', 'is_active', 'is_remote')
    prepopulated_fields = {'slug': ('label',)}


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'company_name', 'status', 'work_type', 'is_featured', 'poster', 'created_at'
    )
    list_filter = ('status', 'work_type', 'schedule_type', 'is_featured')
    search_fields = ('title', 'company_name', 'description')
    list_editable = ('status', 'is_featured')
    raw_id_fields = ('poster',)
