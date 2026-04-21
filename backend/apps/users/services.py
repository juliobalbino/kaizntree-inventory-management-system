from .models import User


def create_user(email: str, password: str, first_name: str = "", last_name: str = "") -> User:
    return User.objects.create_user(email=email, password=password, first_name=first_name, last_name=last_name)


def update_user(user: User, data: dict) -> User:
    for field, value in data.items():
        if field == "password":
            user.set_password(value)
        else:
            setattr(user, field, value)
    user.save()
    return user


def delete_user(user: User) -> None:
    user.delete()