from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from jobs.models import Job

from .models import Application, Chat, ChatMessage, Favorite, Notification, Report
from .serializers import (
    ApplicationSerializer,
    ChatListSerializer,
    ChatMessageSerializer,
    ChatSerializer,
    FavoriteSerializer,
    NotificationSerializer,
    ReportSerializer,
)


def notify(user, *, kind, title, body='', link=''):
    if user is None:
        return
    Notification.objects.create(user=user, kind=kind, title=title, body=body, link=link)


class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Favorite.objects.none()
        return Favorite.objects.filter(user=self.request.user).select_related('job')

    def perform_create(self, serializer):
        # Idempotent toggle-on: re-favoriting an existing job is a no-op.
        job = serializer.validated_data['job']
        existing = Favorite.objects.filter(user=self.request.user, job=job).first()
        if existing:
            serializer.instance = existing
            return
        serializer.save(user=self.request.user)


class ChatViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        return ChatListSerializer if self.action == 'list' else ChatSerializer

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Chat.objects.none()
        return (
            Chat.objects.filter(participants=self.request.user)
            .prefetch_related('messages', 'participants')
            .distinct()
        )

    @action(detail=False, methods=['post'])
    def start(self, request):
        """Find-or-create a chat for a job with a counterpart user."""
        job_id = request.data.get('job_id')
        other_user_id = request.data.get('user_id') or request.data.get('participant_id')
        job = get_object_or_404(Job, pk=job_id) if job_id else None

        participants = {request.user.id}
        if other_user_id:
            participants.add(int(other_user_id))
        elif job is not None:
            participants.add(job.poster_id)
        if len(participants) < 2:
            raise ValidationError('A chat needs a counterpart (user_id or a job poster).')

        existing = (
            Chat.objects.filter(job=job, participants=request.user)
            .filter(participants__id__in=participants)
            .distinct()
        )
        for chat in existing:
            if set(chat.participants.values_list('id', flat=True)) == participants:
                return Response(ChatSerializer(chat, context={'request': request}).data)

        chat = Chat.objects.create(job=job)
        chat.participants.set(participants)
        return Response(
            ChatSerializer(chat, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['get', 'post'])
    def messages(self, request, pk=None):
        chat = self.get_object()
        if request.method.lower() == 'post':
            body = (request.data.get('body') or '').strip()
            if not body:
                raise ValidationError({'body': 'Message body is required.'})
            message = ChatMessage.objects.create(chat=chat, sender=request.user, body=body)
            chat.save(update_fields=['updated_at'])
            for participant in chat.participants.exclude(id=request.user.id):
                notify(
                    participant,
                    kind=Notification.Kind.MESSAGE,
                    title=f'New message from {request.user.display_name}',
                    body=body[:120],
                    link=f'/chat/{chat.id}',
                )
            return Response(
                ChatMessageSerializer(message).data, status=status.HTTP_201_CREATED
            )

        # GET — return the thread and mark counterpart messages as read.
        ChatMessage.objects.filter(chat=chat, read=False).exclude(
            sender=request.user
        ).update(read=True)
        qs = chat.messages.all()
        return Response(ChatMessageSerializer(qs, many=True).data)


class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    permission_classes = (permissions.IsAuthenticated,)
    http_method_names = ('get', 'post', 'patch', 'head', 'options')

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Application.objects.none()
        user = self.request.user
        # Applicants see their own; posters see applications to their jobs.
        return (
            Application.objects.filter(Q(applicant=user) | Q(job__poster=user))
            .select_related('job', 'applicant')
            .distinct()
        )

    def perform_create(self, serializer):
        job = serializer.validated_data['job']
        if job.poster_id == self.request.user.id:
            raise ValidationError('You cannot apply to your own job.')
        if Application.objects.filter(job=job, applicant=self.request.user).exists():
            raise ValidationError('You have already applied to this job.')
        application = serializer.save(applicant=self.request.user)
        notify(
            job.poster,
            kind=Notification.Kind.APPLICATION,
            title=f'New applicant for {job.title}',
            body=f'{self.request.user.display_name} applied.',
            link=f'/job/{job.id}',
        )
        return application

    def perform_update(self, serializer):
        application = self.get_object()
        user = self.request.user
        new_status = serializer.validated_data.get('status')
        is_poster = application.job.poster_id == user.id
        is_applicant = application.applicant_id == user.id
        # Posters drive the pipeline; applicants may only withdraw.
        if new_status and new_status != application.status:
            if is_applicant and not is_poster and new_status != Application.Status.WITHDRAWN:
                raise PermissionDenied('Applicants can only withdraw an application.')
            if not (is_poster or is_applicant):
                raise PermissionDenied('Not allowed.')
        saved = serializer.save()
        if is_poster and new_status:
            notify(
                application.applicant,
                kind=Notification.Kind.APPLICATION_UPDATE,
                title=f'Your application was {saved.get_status_display().lower()}',
                body=application.job.title,
                link=f'/job/{application.job_id}',
            )


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Notification.objects.none()
        return Notification.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = Notification.objects.filter(user=request.user, read=False).count()
        return Response({'count': count})

    @action(detail=False, methods=['post'])
    def read_all(self, request):
        Notification.objects.filter(user=request.user, read=False).update(read=True)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def read(self, request, pk=None):
        notification = self.get_object()
        notification.read = True
        notification.save(update_fields=['read'])
        return Response(NotificationSerializer(notification).data)


class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    permission_classes = (permissions.IsAuthenticated,)
    http_method_names = ('get', 'post', 'head', 'options')

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Report.objects.none()
        user = self.request.user
        if getattr(user, 'role', None) == 'admin':
            return Report.objects.all()
        return Report.objects.filter(reporter=user)

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)
