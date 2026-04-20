from rest_framework import status
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
    UpdateMemberRoleSerializer,
)
from .services import (
    add_member_to_organization,
    create_organization_by_admin,
    delete_organization,
    remove_member,
    update_member_role,
    update_organization,
)


class OrganizationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orgs = get_organizations_for_user(request.user)
        return Response(OrganizationSerializer(orgs, many=True).data)


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


class MemberListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsOrganizationOwner]

    def get(self, request, pk):
        org = get_organization_by_id(request.user, pk)
        members = get_members_for_organization(org)
        return Response(MemberSerializer(members, many=True).data)

    def post(self, request, pk):
        org = get_organization_by_id(request.user, pk)
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
        serializer = UpdateMemberRoleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        updated = update_member_role(membership, serializer.validated_data["role"])
        return Response(MemberSerializer(updated).data)

    def delete(self, request, pk, user_id):
        org = get_organization_by_id(request.user, pk)
        membership = get_membership_by_user_id(org, user_id)
        remove_member(membership)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminOrganizationListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        orgs = get_all_organizations()
        return Response(AdminOrganizationSerializer(orgs, many=True).data)

    def post(self, request):
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
