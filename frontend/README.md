# Menu Calc Frontend

React + TypeScript frontend for managing and generating ingredient orders.

## Requirements

- Node.js 20+
- npm 10+

## Setup

```bash
npm install
npm run dev
```

App URL: `http://localhost:5173`

## Build

```bash
npm run build
npm run preview
```

## Backend Integration

The frontend expects the backend API at:

`http://localhost:8000/api`

You can override it with:

```bash
VITE_API_BASE_URL=http://localhost:8000/api npm run dev
```

For Docker Compose, this variable is already set in `docker-compose.yml`.

## Main Features

- Navigation menu per entity using React Router.
- Material UI design system for layout, forms, and tables.
- CRUD for `Products`, `Product Quantities`, `Recipes`, and `Days`.
- Paginated list views with backend `limit/offset`.
- Order generation by period and day templates.
- Orders list with generated ingredient details.
