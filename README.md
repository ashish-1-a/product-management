# Product Management System

A production-minded full-stack Product Management application built using React, TypeScript, FastAPI, PostgreSQL, SQLAlchemy, Alembic, Docker, Docker Compose, and Nginx.

The application provides complete product CRUD operations along with search, status filtering, pagination, validation, error handling, health checks, database migrations, and persistent PostgreSQL storage.

---

## Setup

### 1. Prerequisites

The recommended setup requires only:

- Git
- Docker
- Docker Compose

No separate installation of the following is required for the Docker-based setup:

- Python
- Node.js
- npm
- PostgreSQL
- FastAPI
- SQLAlchemy
- Alembic
- Nginx

All application dependencies are installed and configured inside the Docker containers.

### 2. Verify Docker Installation

Check Docker:

```bash
docker --version




product-management/
│
├── backend/
│   │
│   ├── app/
│   │   │
│   │   ├── api/
│   │   │   └── products.py
│   │   │
│   │   ├── core/
│   │   │   └── config.py
│   │   │
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   ├── models.py
│   │   │   └── migrations/
│   │   │
│   │   ├── schemas/
│   │   │   └── product.py
│   │   │
│   │   ├── services/
│   │   │   └── products.py
│   │   │
│   │   └── main.py
│   │
│   ├── tests/
│   │   └── test_products.py
│   │
│   ├── alembic.ini
│   ├── entrypoint.sh
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   │
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── products/
│   │   │   └── ui/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── types/
│   │   └── main.tsx
│   │
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.ts
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
