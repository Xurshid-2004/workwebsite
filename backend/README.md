# IshTop — Django REST API

Production backend for the IshTop job marketplace (Next.js frontend). Powers the
job feed, **geo "jobs near me"** search, chat, applications and notifications.

## Quick start

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows  (source .venv/bin/activate on *nix)
pip install -r requirements.txt
copy .env.example .env         # cp on *nix
python manage.py migrate
python manage.py seed          # demo data: 60 jobs across Uzbekistan
python manage.py runserver 8000
```

Point the frontend at it via `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Interactive API docs: <http://localhost:8000/api/docs/> (Swagger) ·
<http://localhost:8000/api/redoc/> (ReDoc) · schema at `/api/schema/`.

Demo accounts (password `Parol123!`): `admin@ishtop.uz` (admin),
`hr1@ishtop.uz` … (posters), `user1@ishtop.uz` … (seekers).

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health/` | Liveness probe (checks DB) |
| POST | `/api/auth/register/` | Register (`name`, `email`, `password`, `profile_role`) |
| POST | `/api/auth/login/` | JWT login → `{access, refresh, user}` |
| POST | `/api/auth/refresh/` | Refresh access token |
| GET | `/api/auth/me/` | Current user |
| PATCH | `/api/profile/` | Update profile (incl. notifications) |
| GET/POST | `/api/jobs/` | List/create jobs (filter + search + geo) |
| GET/PATCH/DELETE | `/api/jobs/{id}/` | Job detail (GET increments views) |
| GET | `/api/jobs/featured/` | Featured jobs |
| GET | `/api/jobs/mine/` | Current user's posted jobs |
| GET | `/api/categories/` | Categories with `job_count` |
| GET | `/api/locations/` | Cities/districts with coordinates |
| GET/POST/DELETE | `/api/favorites/` | Saved jobs |
| GET/POST | `/api/chats/` · `/api/chats/start/` | Conversations (find-or-create) |
| GET/POST | `/api/chats/{id}/messages/` | Thread + send message |
| GET/POST/PATCH | `/api/applications/` | Job applications pipeline |
| GET | `/api/notifications/` · `/unread_count/` · `/read_all/` | Notifications |
| GET/POST | `/api/reports/` | Abuse reports |

### Geo search ("jobs near me")

```
GET /api/jobs/?near=<lat>,<lng>&radius_km=15
```

Returns active jobs within the radius, **ordered nearest-first**, each annotated
with a `distance` (km). Implemented with an indexed bounding-box pre-filter plus a
great-circle distance computed in the database (works on SQLite and PostgreSQL —
no PostGIS required). Also accepts `?lat=&lng=`.

### Filtering & search

`?search=`, `?category=` / `?category_slug=`, `?work_type=`, `?schedule_type=`,
`?schedule_pattern=`, `?is_remote=`, `?is_featured=`, `?location=`,
`?salary_min=` / `?salary_max=`, `?ordering=salary_max|-created_at|views_count`,
`?page=` / `?page_size=`, `?mine=true`.

## Production

- `DJANGO_DEBUG=false` enables HSTS, secure cookies and SSL redirect.
- Use `DATABASE_URL` with PostgreSQL (persistent connections via `DB_CONN_MAX_AGE`).
- `python manage.py collectstatic` — WhiteNoise serves hashed static assets.
- Run with gunicorn: `gunicorn config.wsgi --bind 0.0.0.0:8000`.
- Set a strong `DJANGO_SECRET_KEY` and the right `CORS_ALLOWED_ORIGINS`.
