from api.models import User
User.objects.filter(role='member', created_by__isnull=True).update(created_by_id=1)