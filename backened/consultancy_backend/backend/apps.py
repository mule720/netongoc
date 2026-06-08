from django.apps import AppConfig


class BackendConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend'

    def ready(self):
        # import signal handlers
        try:
            from . import signals  # noqa: F401
        except Exception:
            pass

        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            if not User.objects.filter(email='admin@netonlimited.com').exists():
                User.objects.create_superuser(
                    username='admin@netonlimited.com',
                    email='admin@netonlimited.com',
                    password='Admin123!'
                )
        except Exception:
            pass
