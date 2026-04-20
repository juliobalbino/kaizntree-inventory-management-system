from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from common.permissions import IsOrganizationOwner

from .selectors import (
    get_members_for_organization,
    get_membership_by_user_id,
    get_organization_by_id,
    get_organizations_for_user,
    is_organization_owner,
)
from .serializers import (
    AddMemberSerializer,
    CreateOrganizationSerializer,
    MemberSerializer,
    OrganizationSerializer,
    UpdateMemberRoleSerializer,
)
from .services import (
    add_member_to_organization,
    create_organization,
    remove_member,
    update_member_role,
    update_organization,
)


class OrganizationListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orgs = get_organizations_for_user(request.user)
        return Response(OrganizationSerializer(orgs, many=True).data)

    def post(self, request):
        serializer = CreateOrganizationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        org = create_organization(name=serializer.validated_data["name"], user=request.user)
        return Response(OrganizationSerializer(org).data, status=status.HTTP_201_CREATED)


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
