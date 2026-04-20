from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User
from .services import create_user


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def create(self, validated_data):
        return create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    current_organization = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "current_organization"]

    def get_current_organization(self, obj):
        if not obj.current_organization_id:
            return None
        return {
            "id": str(obj.current_organization.id),
            "name": obj.current_organization.name,
            "slug": obj.current_organization.slug,
        }


class SwitchOrganizationSerializer(serializers.Serializer):
    organization_id = serializers.UUIDField()


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
