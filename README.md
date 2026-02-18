# Menu Calc

Full-stack application to generate ingredient orders from recipes across a given time period.

## Repository Structure

- `backend/`: Django + DRF API.
- `frontend/`: React + TypeScript + Vite app.
- `docker-compose.yml`: local container orchestration (frontend + backend + PostgreSQL).

## Stack

- Backend: Django + Django REST Framework
- Frontend: React + TypeScript + Vite

## Requirements

- Python 3.12+
- Node.js 20+
- Docker Desktop (optional, for containerized setup)

## Domain Model

- `ProductQuantity`: age group, unit of measure, quantity, package type.
- `Product`: name, category, quantities.
- `Recipe`: name, products.
- `Day`: name, recipes.
- `OrderProduct`: name, package type, quantity, unit of measure.
- `Order`: name, date, products.

## Backend Setup

Copy env template first:

```bash
cd backend
cp .env.example .env
```

### Option 1: Pipenv (recommended)

```bash
cd backend
pipenv install
pipenv run python manage.py migrate
pipenv run python manage.py runserver
```

### Option 2: venv + requirements.txt

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

API base URL: `http://localhost:8000/api/`

### Database Configuration

Backend settings are read from `backend/.env`.

- Use PostgreSQL by setting `DB_ENGINE=postgresql` and filling `POSTGRES_*` values.
- Use SQLite by setting `DB_ENGINE=sqlite` (uses `SQLITE_PATH`).

### Main Endpoints

- `GET/POST /api/products/`
- `GET/POST /api/product-quantities/`
- `GET/POST /api/recipes/`
- `GET/POST /api/days/`
- `GET /api/orders/`
- `POST /api/orders/generate/`

Example payload for `POST /api/orders/generate/`:

```json
{
  "name": "Week 1 Order",
  "start_date": "2026-02-01",
  "end_date": "2026-02-14",
  "day_ids": [1, 2, 3, 4, 5]
}
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## Local Dev (without Docker)

Run backend and frontend in separate terminals:

```bash
# Terminal 1
cd backend
cp .env.example .env
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

```bash
# Terminal 2
cd frontend
npm install
npm run dev
```

## Docker Setup

Run full stack (frontend + backend + PostgreSQL):

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api/`
- Swagger: `http://localhost:8000/api/docs/`

Stop and remove containers:

```bash
docker compose down
```

Stop and also remove DB volume:

```bash
docker compose down -v
```

## Notes

- Do not commit `backend/.env` (contains local credentials/secrets).
- Keep `backend/.env.example` updated when adding new backend environment variables.

## Architecture Notes

- Business rules are inside `ordering/domain/services.py`.
- Use case orchestration is in `ordering/application/use_cases.py`.
- Database access is implemented in `ordering/infrastructure/repositories.py`.
- DRF views/serializers only perform input/output and call the use case.
