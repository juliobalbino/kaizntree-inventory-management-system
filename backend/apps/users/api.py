from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny

from .serializers import RegisterSerializer, UserSerializer

class RegisterView(CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def get_serializer_class(self):
        return RegisterSerializer

    def perform_create(self, serializer):
        self.created_user = serializer.save()

    def get_response_data(self):
        return UserSerializer(self.created_user).data