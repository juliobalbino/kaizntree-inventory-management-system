from rest_framework import serializers

from apps.users.models import User

from .models import Organization, OrganizationMembership


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ["id", "name", "slug", "created_at"]
        read_only_fields = ["id", "slug", "created_at"]


class CreateOrganizationSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)


class MemberSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source="user.id", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    role = serializers.CharField(read_only=True)

    class Meta:
        model = OrganizationMembership
        fields = ["id", "email", "first_name", "last_name", "role"]


class AddMemberSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    role = serializers.ChoiceField(choices=["owner", "member"], default="member")


class UpdateMemberRoleSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=["owner", "member"])


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
        memberships = obj.memberships.select_related("user").all()
        return [
            {
                "id": str(m.user.id),
                "email": m.user.email,
                "first_name": m.user.first_name,
                "last_name": m.user.last_name,
                "role": m.role,
            }
            for m in memberships
        ]
