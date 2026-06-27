from django.db import connection
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def health(request):
    """Liveness/readiness probe — verifies the DB connection."""
    db_ok = True
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
            cursor.fetchone()
    except Exception:  # pragma: no cover - defensive
        db_ok = False
    return Response(
        {'status': 'ok' if db_ok else 'degraded', 'database': 'up' if db_ok else 'down'},
        status=200 if db_ok else 503,
    )
