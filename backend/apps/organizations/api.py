from rest_framework import generics, status
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from common.permissions import IsAdmin, IsOrganizationOwner

from .selectors import (
    get_all_organizations,
    get_members_for_organization,
    get_membership_by_user_id,
    get_organization_by_id,
    get_organization_by_id_admin,
    get_organizations_for_user,
    is_organization_owner,
)
from .serializers import (
    AddMemberSerializer,
    AdminCreateOrganizationSerializer,
    AdminOrganizationSerializer,
    CreateOrganizationSerializer,
    MemberSerializer,
    OrganizationSerializer,
    UpdateMemberSerializer,
)
from .services import (
    add_member_to_organization,
    create_organization_by_admin,
    delete_organization,
    remove_member,
    update_member,
    update_organization,
)


class OrganizationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrganizationSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "slug"]
    ordering_fields = ["name", "slug", "created_at"]
    ordering = ["name"]

    def get_queryset(self):
        return get_organizations_for_user(self.request.user)


class OrganizationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        org = get_organization_by_id(request.user, pk)
        return Response(OrganizationSerializer(org).data)

    def patch(self, request, pk):
        org = get_organization_by_id(request.user, pk)
        if not is_organization_owner(request.user, org):
            return Response(
                {"detail": "Only owners can update the organization."},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = CreateOrganizationSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = update_organization(org, serializer.validated_data)
        return Response(OrganizationSerializer(updated).data)


class MemberListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsOrganizationOwner]
    serializer_class = MemberSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["email", "first_name", "last_name"]
    ordering_fields = ["email", "first_name", "last_name", "role"]
    ordering = ["email"]

    def get_queryset(self):
        org = get_organization_by_id(self.request.user, self.kwargs["pk"])
        return get_members_for_organization(org)

    def create(self, request, *args, **kwargs):
        org = get_organization_by_id(request.user, self.kwargs["pk"])
        serializer = AddMemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        membership = add_member_to_organization(org, serializer.validated_data)
        return Response(MemberSerializer(membership).data, status=status.HTTP_201_CREATED)


class MemberDetailView(APIView):
    permission_classes = [IsAuthenticated, IsOrganizationOwner]

    def get(self, request, pk, user_id):
        org = get_organization_by_id(request.user, pk)
        membership = get_membership_by_user_id(org, user_id)
        return Response(MemberSerializer(membership).data)

    def patch(self, request, pk, user_id):
        org = get_organization_by_id(request.user, pk)
        membership = get_membership_by_user_id(org, user_id)
        serializer = UpdateMemberSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = update_member(membership, serializer.validated_data)
        return Response(MemberSerializer(updated).data)

    def delete(self, request, pk, user_id):
        org = get_organization_by_id(request.user, pk)
        membership = get_membership_by_user_id(org, user_id)
        remove_member(membership)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminOrganizationListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = AdminOrganizationSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = [
        "name",
        "slug",
        "users__first_name",
        "users__last_name",
        "users__email",
    ]
    ordering_fields = ["name", "slug"]
    ordering = ["name"]

    def get_queryset(self):
        return get_all_organizations().distinct()

    def create(self, request, *args, **kwargs):
        serializer = AdminCreateOrganizationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        org = create_organization_by_admin(
            name=serializer.validated_data["name"],
            owner_email=serializer.validated_data["owner_email"],
        )
        return Response(AdminOrganizationSerializer(org).data, status=status.HTTP_201_CREATED)


class AdminOrganizationDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, pk):
        org = get_organization_by_id_admin(pk)
        return Response(AdminOrganizationSerializer(org).data)

    def patch(self, request, pk):
        org = get_organization_by_id_admin(pk)
        serializer = CreateOrganizationSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = update_organization(org, serializer.validated_data)
        return Response(AdminOrganizationSerializer(updated).data)

    def delete(self, request, pk):
        org = get_organization_by_id_admin(pk)
        delete_organization(org)
        return Response(status=status.HTTP_204_NO_CONTENT)
