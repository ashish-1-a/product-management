# Product Management System


Backend NGINX Note

For the current assignment, NGINX is configured for the frontend and API reverse-proxy routing. The backend is directly exposed on port 8000 for local testing and easier API verification.

In a production deployment, the backend port would typically remain internal and API traffic would be routed through NGINX / Load Balancer, with HTTPS, access controls, rate limiting, and other security policies applied at the edge.

This setup keeps the assignment simple to run and test locally while following a more production-oriented architecture for future deployment.

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

##3. Clone the Repository

Clone the project:

git clone https://github.com/ashish-1-a/product-management.git

Go inside the project:

cd product-management

## 4. Configure Environment Variables

Create the local .env file from the provided example:

cp .env.example .env

The .env.example file contains the configuration required for local Docker execution.

You normally do not need to change anything for local testing.

Important:

.env contains local configuration and should not be committed to Git.
.env.example is provided as a safe configuration template.
Production credentials should always be replaced with secure credentials.

## 5. Start the Complete Application

Run:

docker compose up --build

Or run in the background:

docker compose up --build -d

This single command starts the complete application.

Docker Compose automatically:

Builds the backend image.
Builds the frontend image.
Starts PostgreSQL.
Waits for PostgreSQL to become healthy.
Runs Alembic database migrations.
Starts the FastAPI backend.
Starts Nginx.
Serves the React frontend.
Routes /api/* requests from Nginx to FastAPI.


###  6. Check Application Status

Open another terminal:

docker compose ps

You should see three services:

product-management-db
product-management-backend
product-management-frontend

The database and backend have Docker health checks.

## 7. Open the Application

Open the following URL in your browser:

http://localhost:3000

The Product Management dashboard should appear.

##  8. Backend API

The FastAPI backend is available at:

http://localhost:8000

Swagger API documentation:

http://localhost:8000/docs

ReDoc:

http://localhost:8000/redoc

Backend health check:

http://localhost:8000/health

Test it using:

curl http://localhost:8000/health

Expected response:

{
  "status": "ok"
}

###9. Frontend Health Check

The frontend is served through Nginx.

Test:

curl http://localhost:3000/health

Expected response:

{
  "status": "ok"
}

You can also verify API routing through Nginx:

curl http://localhost:3000/api/products

The request flow is:

Browser
   |
   v
Nginx
   |
   v
FastAPI
   |
   v
PostgreSQL

## 10. Database Persistence

PostgreSQL uses a Docker named volume:

postgres_data

This means product data remains available when containers are restarted.

For example:

docker compose restart

After the restart, open:

http://localhost:3000

Existing products should still be available.

IMPORTANT:

Do not run this unless you intentionally want to delete the local database:

docker compose down -v

The -v option removes the PostgreSQL volume and therefore deletes the stored local database data.

## 11. Useful Docker Commands

Check running services:

docker compose ps

View all logs:

docker compose logs

View backend logs:

docker compose logs backend

View frontend logs:

docker compose logs frontend

View database logs:

docker compose logs db

Follow backend logs:

docker compose logs -f backend

Stop the application:

docker compose down

Start the application again:

docker compose up -d

Rebuild the application:

docker compose up --build








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
