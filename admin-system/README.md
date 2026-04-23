# Seller Admin System

This directory contains the seller admin workspace for the marketplace project.

## Stack

- Frontend: Vue 3 + Vite + TypeScript + Ant Design Vue + Pinia
- Backend: Python + FastAPI

## Structure

```text
admin-system/
├── frontend/   # Seller admin web app
└── backend/    # Seller admin API
```

## Frontend

```bash
cd admin-system/frontend
npm install
npm run dev
```

Default local URL:

```text
http://127.0.0.1:3001
```

## Backend

```bash
cd admin-system/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8002
```

Default local URL:

```text
http://127.0.0.1:8002
```

## Current Scope

The first scaffold includes:

- Admin shell layout
- Dashboard overview
- Products management view
- Orders management view
- Inquiries follow-up view
- Shop settings view
- Mock API endpoints for dashboard, products, orders, inquiries, and settings

## Next Steps

- Add authentication and role permissions
- Connect real seller data models
- Add CRUD flows for products
- Add order processing and fulfillment actions
- Add inquiry assignment and internal notes
