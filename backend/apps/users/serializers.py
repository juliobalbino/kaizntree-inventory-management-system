from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    organization = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "is_admin", "organization", "role"]

    def get_organization(self, obj):
        if not obj.organization_id:
            return None
        return {
            "id": str(obj.organization.id),
            "name": obj.organization.name,
            "slug": obj.organization.slug,
        }

    def get_role(self, obj):
        if obj.is_admin:
            return "admin"
        return obj.role


class UpdateProfileSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=False)
    last_name = serializers.CharField(max_length=150, required=False)


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
        if not obj.organization_id:
            return []
        return [
            {
                "id": str(obj.organization.id),
                "name": obj.organization.name,
                "role": obj.role,
            }
        ]
