from rest_framework import serializers

from apps.users.models import User

from .models import Organization


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ["id", "name", "slug", "created_at"]
        read_only_fields = ["id", "slug", "created_at"]


class CreateOrganizationSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "role"]


class AddMemberSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    role = serializers.ChoiceField(choices=["owner", "member"], default="member")


class UpdateMemberSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=False)
    last_name = serializers.CharField(max_length=150, required=False)
    email = serializers.EmailField(required=False)
    role = serializers.ChoiceField(choices=["owner", "member"], required=False)


class AdminCreateOrganizationSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    owner_email = serializers.EmailField()

    def validate_owner_email(self, value):
        if not User.objects.filter(email=value, is_admin=False).exists():
            raise serializers.ValidationError("User not found or is an admin user.")
        return value


class AdminOrganizationSerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = ["id", "name", "slug", "members", "created_at"]
        read_only_fields = ["id", "slug", "created_at"]

    def get_members(self, obj):
        users = obj.users.all()
        return [
            {
                "id": str(u.id),
                "email": u.email,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "role": u.role,
            }
            for u in users
        ]
