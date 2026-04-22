from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.conf import settings
from decouple import config

class Command(BaseCommand):
    help = 'Cria um usuário admin inicial baseado no .env'

    def handle(self, *args, **options):
        User = get_user_model()
        email = config('INITIAL_ADMIN_EMAIL', default=None)
        password = config('INITIAL_ADMIN_PASSWORD', default=None)

        if not email or not password:
            self.stdout.write(self.style.WARNING('INITIAL_ADMIN_EMAIL ou INITIAL_ADMIN_PASSWORD não configurados.'))
            return

        if not User.objects.filter(email=email).exists():
            self.stdout.write(f'Criando usuário admin: {email}...')
            User.objects.create_superuser(
                email=email,
                password=password,
                first_name='Admin',
                last_name='Initial',
                is_admin=True  # Garantindo que o campo is_admin do seu modelo também seja True
            )
            self.stdout.write(self.style.SUCCESS(f'Usuário {email} criado com sucesso!'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Usuário {email} já existe.'))
