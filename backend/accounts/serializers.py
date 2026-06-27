from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import DEFAULT_NOTIFICATION_SETTINGS

User = get_user_model()


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields.pop('username', None)

    def validate(self, attrs):
        email = attrs.get('email', '').lower().strip()
        attrs['username'] = email
        data = super().validate(attrs)
        if getattr(self.user, 'blocked', False):
            raise serializers.ValidationError('This account has been blocked.')
        # Surface the profile alongside the token pair so the client can
        # avoid a second round-trip on login.
        data['user'] = UserSerializer(self.user).data
        return data


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    notifications = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'name',
            'role',
            'profile_role',
            'phone',
            'title',
            'avatar_url',
            'language',
            'badge',
            'company_id',
            'notifications',
            'blocked',
        )
        read_only_fields = ('id', 'email', 'role', 'badge', 'company_id', 'blocked')

    def get_name(self, obj: User) -> str:
        return obj.display_name

    def get_notifications(self, obj: User) -> dict:
        return obj.merged_notifications()

    def update(self, instance, validated_data):
        # `name` arrives as a writable virtual field — map it to first_name.
        name = self.initial_data.get('name')
        if name is not None:
            instance.first_name = str(name).strip()
            instance.last_name = ''
        notifications = self.initial_data.get('notifications')
        if isinstance(notifications, dict):
            merged = instance.merged_notifications()
            merged.update({k: bool(v) for k, v in notifications.items() if k in DEFAULT_NOTIFICATION_SETTINGS})
            instance.notifications = merged
        return super().update(instance, validated_data)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    name = serializers.CharField(write_only=True)
    profile_role = serializers.ChoiceField(choices=User.ProfileRole.choices, default=User.ProfileRole.BOTH)

    class Meta:
        model = User
        fields = ('email', 'password', 'name', 'profile_role')

    def validate_email(self, value: str) -> str:
        email = value.lower().strip()
        if User.objects.filter(username=email).exists() or User.objects.filter(email=email).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return email

    def create(self, validated_data):
        name = validated_data.pop('name').strip()
        profile_role = validated_data.pop('profile_role', User.ProfileRole.BOTH)
        email = validated_data['email']
        role = User.Role.POSTER if profile_role == User.ProfileRole.POSTER else User.Role.SEEKER
        user = User.objects.create_user(
            username=email,
            email=email,
            password=validated_data['password'],
            first_name=name,
            profile_role=profile_role,
            role=role,
        )
        return user
