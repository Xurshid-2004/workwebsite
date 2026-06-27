from django.contrib import admin

from .models import Application, Chat, ChatMessage, Favorite, Notification, Report


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'job', 'created_at')
    raw_id_fields = ('user', 'job')


class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ('id', 'job', 'updated_at')
    inlines = (ChatMessageInline,)


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('id', 'job', 'applicant', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('job__title', 'applicant__username')
    raw_id_fields = ('job', 'applicant')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'kind', 'title', 'read', 'created_at')
    list_filter = ('kind', 'read')


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('reason', 'status', 'reporter', 'created_at')
    list_filter = ('status',)
