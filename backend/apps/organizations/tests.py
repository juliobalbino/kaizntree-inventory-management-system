import pytest
from conftest import OrganizationFactory, UserFactory
from apps.organizations.models import Organization

@pytest.mark.django_db
class TestOrganizationAPI:
    def test_list_user_organizations(self, auth_client, organization):
        # auth_client is authenticated as user who belongs to 'organization'
        response = auth_client.get("/api/organizations/")
        assert response.status_code == 200
        assert response.data["count"] >= 1
        assert any(o["id"] == str(organization.id) for o in response.data["results"])

    def test_get_organization_detail(self, auth_client, organization):
        response = auth_client.get(f"/api/organizations/{organization.id}/")
        assert response.status_code == 200
        assert response.data["name"] == organization.name

    def test_update_organization_as_owner(self, auth_client, organization, user):
        # 'user' is owner by default in UserFactory
        response = auth_client.patch(f"/api/organizations/{organization.id}/", {"name": "New Org Name"})
        assert response.status_code == 200
        assert response.data["name"] == "New Org Name"

@pytest.mark.django_db
class TestMembershipAPI:
    def test_list_members(self, auth_client, organization):
        UserFactory(organization=organization, email="member1@test.com")
        
        response = auth_client.get(f"/api/organizations/{organization.id}/members/")
        assert response.status_code == 200
        assert response.data["count"] >= 2 # Owner + new member

    def test_add_member(self, auth_client, organization):
        payload = {
            "email": "newbie@test.com", 
            "password": "password123",
            "first_name": "New",
            "last_name": "Member",
            "role": "member"
        }
        response = auth_client.post(f"/api/organizations/{organization.id}/members/", payload)
        
        assert response.status_code == 201
        assert response.data["email"] == "newbie@test.com"

    def test_remove_member(self, auth_client, organization):
        other = UserFactory(organization=organization)
        response = auth_client.delete(f"/api/organizations/{organization.id}/members/{other.id}/")
        
        assert response.status_code == 204
