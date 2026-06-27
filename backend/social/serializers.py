from rest_framework import serializers

from jobs.models import Job

from .models import Application, Chat, ChatMessage, Favorite, Notification, Report


class FavoriteSerializer(serializers.ModelSerializer):
    job_id = serializers.PrimaryKeyRelatedField(
        source='job', queryset=Job.objects.all()
    )

    class Meta:
        model = Favorite
        fields = ('id', 'job_id', 'created_at')
        read_only_fields = ('id', 'created_at')


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.IntegerField(source='sender.id', read_only=True)

    class Meta:
        model = ChatMessage
        fields = ('id', 'chat_id', 'sender_id', 'body', 'read', 'created_at')
        read_only_fields = ('id', 'chat_id', 'sender_id', 'read', 'created_at')


class ChatSerializer(serializers.ModelSerializer):
    job_id = serializers.PrimaryKeyRelatedField(
        source='job', queryset=Job.objects.all(), required=False, allow_null=True
    )
    participant_ids = serializers.PrimaryKeyRelatedField(
        many=True, read_only=True, source='participants'
    )
    messages = ChatMessageSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = (
            'id',
            'job_id',
            'participant_ids',
            'messages',
            'last_message',
            'unread_count',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_last_message(self, obj: Chat):
        message = obj.messages.order_by('-created_at').first()
        return ChatMessageSerializer(message).data if message else None

    def get_unread_count(self, obj: Chat) -> int:
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        return obj.messages.filter(read=False).exclude(sender=request.user).count()


class ChatListSerializer(ChatSerializer):
    """Lighter chat shape for list views — omits the full message history."""

    class Meta(ChatSerializer.Meta):
        fields = (
            'id',
            'job_id',
            'participant_ids',
            'last_message',
            'unread_count',
            'created_at',
            'updated_at',
        )


class ApplicationSerializer(serializers.ModelSerializer):
    job_id = serializers.PrimaryKeyRelatedField(source='job', queryset=Job.objects.all())
    applicant_id = serializers.IntegerField(source='applicant.id', read_only=True)
    applicant_name = serializers.CharField(source='applicant.display_name', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)

    class Meta:
        model = Application
        fields = (
            'id',
            'job_id',
            'job_title',
            'applicant_id',
            'applicant_name',
            'cover_note',
            'expected_salary',
            'status',
            'created_at',
            'updated_at',
        )
        read_only_fields = (
            'id',
            'applicant_id',
            'applicant_name',
            'job_title',
            'created_at',
            'updated_at',
        )


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'kind', 'title', 'body', 'link', 'read', 'created_at')
        read_only_fields = fields


class ReportSerializer(serializers.ModelSerializer):
    job_id = serializers.PrimaryKeyRelatedField(
        source='job', queryset=Job.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Report
        fields = ('id', 'job_id', 'reason', 'details', 'status', 'created_at')
        read_only_fields = ('id', 'status', 'created_at')
