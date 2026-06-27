# IshTop Django API — production image
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    DJANGO_DEBUG=false

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Build static assets (uses the default SECRET_KEY; real one is injected at runtime).
RUN python manage.py collectstatic --noinput

EXPOSE 8000

# Migrate then serve. Override CMD to run `manage.py seed` once if you want demo data.
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn config.wsgi --bind 0.0.0.0:8000 --workers 3 --timeout 60"]
