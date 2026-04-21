from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from common.permissions import IsAdmin

from apps.organizations.selectors import get_organization_by_id

from .selectors import get_all_users, get_user_by_id
from .serializers import (
    AdminCreateUserSerializer,
    AdminUpdateUserSerializer,
    AdminUserListSerializer,
    ChangePasswordSerializer,
    UpdateProfileSerializer,
    UserSerializer,
)
from .services import create_user, delete_user, update_user


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UpdateProfileSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        update_fields = []
        if "first_name" in data:
            request.user.first_name = data["first_name"]
            update_fields.append("first_name")
        if "last_name" in data:
            request.user.last_name = data["last_name"]
            update_fields.append("last_name")

        if update_fields:
            request.user.save(update_fields=update_fields)

        return Response(UserSerializer(request.user).data)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        return Response({"detail": "Password changed successfully."})


class AdminUserListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        users = get_all_users()
        return Response(AdminUserListSerializer(users, many=True).data)

    def post(self, request):
        serializer = AdminCreateUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = create_user(**serializer.validated_data)
        return Response(AdminUserListSerializer(user).data, status=status.HTTP_201_CREATED)


class AdminUserDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, pk):
        user = get_user_by_id(pk)
        return Response(AdminUserListSerializer(user).data)

    def patch(self, request, pk):
        user = get_user_by_id(pk)
        serializer = AdminUpdateUserSerializer(data=request.data, context={"user_instance": user})
        serializer.is_valid(raise_exception=True)
        updated = update_user(user, serializer.validated_data)
        return Response(AdminUserListSerializer(updated).data)

    def delete(self, request, pk):
        user = get_user_by_id(pk)
        delete_user(user)
        return Response(status=status.HTTP_204_NO_CONTENT)
