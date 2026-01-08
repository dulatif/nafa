# Faceboard NestJS Starter

A robust, modular, and production-ready NestJS starter kit.

## Features

- **Authentication**: JWT-based auth with Access/Refresh tokens.
- **RBAC**: Role-Based Access Control (Roles & Permissions).
- **Users**: Complete CRUD + Pagination.
- **Posts**: Content management example.
- **Storage**: Local and S3-compatible file storage.
- **Health**: System health monitoring.
- **Database**: Prisma ORM with SQLite (LibSQL ready).
- **Validation**: DTO validation with `class-validator`.
- **Documentation**: OpenAPI/Swagger auto-generated docs.

## Prerequisites

- Node.js v20+
- pnpm

## Installation

```bash
$ pnpm install
```

## Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

## Running the application

```bash
# development
$ pnpm start:dev

# production mode
$ pnpm start:prod
```

## Docker Support

Run the application using Docker Compose:

```bash
# Build and start
$ docker-compose up -d --build

# View logs
$ docker-compose logs -f

# Stop
$ docker-compose down
```

## Database Seeding

Populate the database with test data (Admin, Users, Posts):

```bash
$ pnpm prisma db seed
```

## API Documentation

Access Swagger UI at `/api/docs` (e.g., http://localhost:3000/api/docs).

## Testing

```bash
# unit tests
$ pnpm test

# e2e tests
$ pnpm test:e2e

# test coverage
$ pnpm test:cov
```
