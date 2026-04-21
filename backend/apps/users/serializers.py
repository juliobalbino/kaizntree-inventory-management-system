from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    current_organization = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "is_admin", "current_organization", "role"]

    def get_current_organization(self, obj):
        if not obj.current_organization_id:
            return None
        return {
            "id": str(obj.current_organization.id),
            "name": obj.current_organization.name,
            "slug": obj.current_organization.slug,
        }

    def get_role(self, obj):
        if obj.is_admin:
            return "admin"
        if not obj.current_organization_id:
            return None
        membership = obj.memberships.filter(organization=obj.current_organization).first()
        if membership:
            return membership.role
        return None


class UpdateProfileSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=False)
    last_name = serializers.CharField(max_length=150, required=False)
    organization_id = serializers.UUIDField(required=False)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value


class AdminCreateUserSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value


class AdminUpdateUserSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=False)
    last_name = serializers.CharField(max_length=150, required=False)
    email = serializers.EmailField(required=False)
    password = serializers.CharField(write_only=True, min_length=8, required=False)

    def validate_email(self, value):
        user = self.context.get("user_instance")
        if user and User.objects.filter(email=value).exclude(id=user.id).exists():
            raise serializers.ValidationError("Email already exists.")
        return value


class AdminUserListSerializer(serializers.ModelSerializer):
    organizations = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "organizations"]

    def get_organizations(self, obj):
        return [
            {
                "id": str(m.organization.id),
                "name": m.organization.name,
                "role": m.role,
            }
            for m in obj.memberships.select_related("organization").all()
        ]
