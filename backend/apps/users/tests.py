import pytest
from apps.users.selectors import get_users_for_org, get_user_by_id
from django.http import Http404
from conftest import OrganizationFactory, UserFactory

@pytest.mark.django_db
class TestUserIsolation:
    def test_get_users_for_org_only_returns_own_members(self):
        org1 = OrganizationFactory()
        org2 = OrganizationFactory()
        
        u1 = UserFactory(organization=org1, email="user1@org1.com")
        u2 = UserFactory(organization=org2, email="user2@org2.com")
        
        results = get_users_for_org(org1)
        assert results.count() == 1
        assert results[0].email == "user1@org1.com"

    def test_get_user_by_id_with_org_prevents_cross_org_access(self):
        org1 = OrganizationFactory()
        org2 = OrganizationFactory()
        
        u2 = UserFactory(organization=org2)
        
        with pytest.raises(Http404):
            get_user_by_id(u2.id, org=org1)


@pytest.mark.django_db
class TestProfileAPI:
    def test_get_me(self, auth_client, user):
        response = auth_client.get("/api/auth/me/")
        assert response.status_code == 200
        assert response.data["email"] == user.email

    def test_update_me(self, auth_client):
        response = auth_client.patch("/api/auth/me/", {"first_name": "NewName"})
        assert response.status_code == 200
        assert response.data["first_name"] == "NewName"

@pytest.mark.django_db
class TestAdminUserAPI:
    @pytest.fixture
    def admin_client(self, api_client):
        admin = UserFactory(is_admin=True)
        api_client.force_authenticate(user=admin)
        return api_client

    def test_admin_list_users(self, admin_client):
        UserFactory() # Regular user 1
        UserFactory() # Regular user 2
        response = admin_client.get("/api/admin/users/")
        assert response.status_code == 200
        # Should see all users (excluding the admin itself)
        assert response.data["count"] >= 2

    def test_admin_create_user(self, admin_client, organization):
        payload = {
            "email": "admincreated@test.com",
            "password": "password123",
            "first_name": "Admin",
            "last_name": "Created",
        }
        response = admin_client.post("/api/admin/users/", payload)
        assert response.status_code == 201
        assert response.data["email"] == "admincreated@test.com"
