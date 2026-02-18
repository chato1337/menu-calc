# Menu Calc Backend

Django REST Framework backend for generating ingredient orders based on recipes and date periods.

## Requirements

- Python 3.12
- PostgreSQL (optional, SQLite supported)

## Environment

```bash
cp .env.example .env
```

Main variables:

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG`
- `DJANGO_ALLOWED_HOSTS`
- `DB_ENGINE` (`postgresql` or `sqlite`)
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`
- `SQLITE_PATH`
- `CORS_ALLOW_ALL_ORIGINS`
- `CORS_ALLOWED_ORIGINS`
- `API_DEFAULT_LIMIT`
- `API_MAX_LIMIT`

## Setup

### Option 1: Pipenv

```bash
pipenv install
pipenv run python manage.py migrate
pipenv run python manage.py runserver
```

### Option 2: venv + requirements.txt

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## CORS for Frontend

Default CORS allows local Vite frontend origins:

- `http://localhost:5173`
- `http://127.0.0.1:5173`

For custom frontend domains, update `CORS_ALLOWED_ORIGINS` in `.env`.

## Pagination (Limit/Offset)

List endpoints use limit/offset pagination.

Example:

- `/api/products/?limit=20&offset=0`
- `/api/orders/?limit=10&offset=20`

Pagination defaults can be configured with:

- `API_DEFAULT_LIMIT` (default page size)
- `API_MAX_LIMIT` (maximum allowed `limit`)

## API Base URL

`http://localhost:8000/api/`

## Docker

From project root:

```bash
docker compose up --build
```

The backend container reads environment variables from `backend/.env.docker`.

## API Docs (Swagger/OpenAPI)

- OpenAPI schema: `http://localhost:8000/api/schema/`
- Swagger UI: `http://localhost:8000/api/docs/`

To export the OpenAPI JSON file in the backend root:

```bash
bash export_openapi.sh
```

Alternative with Pipenv script:

```bash
pipenv run export-openapi
```

## Main Endpoints

- `GET/POST /api/products/`
- `GET/POST /api/product-quantities/`
- `GET/POST /api/recipes/`
- `GET/POST /api/days/`
- `GET /api/orders/`
- `POST /api/orders/generate/`

Example payload:

```json
{
  "name": "Week 1 Order",
  "start_date": "2026-02-01",
  "end_date": "2026-02-14",
  "day_ids": [1, 2, 3, 4, 5]
}
```
