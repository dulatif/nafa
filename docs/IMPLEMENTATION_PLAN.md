# NestJS Starter Kit - Implementation Plan

> A Laravel-inspired NestJS starter kit with authentication, RBAC, file storage, and more.

---

## Overview

This document outlines the phased implementation of a production-ready NestJS starter kit. Each phase builds upon the previous one and can be committed separately.

---

## Directory Structure (Target)

```
faceboard-nest-scratch/
├── prisma/
│   ├── migrations/
│   ├── seed/
│   │   ├── factories/
│   │   │   ├── user.factory.ts
│   │   │   └── post.factory.ts
│   │   ├── seeders/
│   │   │   ├── role.seeder.ts
│   │   │   ├── user.seeder.ts
│   │   │   └── post.seeder.ts
│   │   └── seed.ts
│   └── schema.prisma
│
├── src/
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── public.decorator.ts
│   │   │   ├── roles.decorator.ts
│   │   │   └── permissions.decorator.ts
│   │   ├── dto/
│   │   │   └── pagination.dto.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── permissions.guard.ts
│   │   ├── interceptors/
│   │   │   ├── response.interceptor.ts
│   │   │   └── logging.interceptor.ts
│   │   ├── helpers/
│   │   │   └── pagination.helper.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   └── common.module.ts
│   │
│   ├── config/
│   │   ├── app.config.ts
│   │   ├── auth.config.ts
│   │   ├── database.config.ts
│   │   ├── storage.config.ts
│   │   ├── swagger.config.ts
│   │   └── index.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts
│   │   │   │   └── register.dto.ts
│   │   │   ├── responses/
│   │   │   │   └── auth.response.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   │
│   │   ├── health/
│   │   │   ├── health.controller.ts
│   │   │   └── health.module.ts
│   │   │
│   │   ├── post/
│   │   │   ├── dto/
│   │   │   │   ├── create-post.dto.ts
│   │   │   │   └── update-post.dto.ts
│   │   │   ├── responses/
│   │   │   │   ├── post.response.ts
│   │   │   │   └── post-list.response.ts
│   │   │   ├── post.controller.ts
│   │   │   ├── post.service.ts
│   │   │   └── post.module.ts
│   │   │
│   │   ├── role/
│   │   │   ├── role.service.ts
│   │   │   └── role.module.ts
│   │   │
│   │   ├── storage/
│   │   │   ├── drivers/
│   │   │   │   ├── local.driver.ts
│   │   │   │   └── s3.driver.ts
│   │   │   ├── dto/
│   │   │   │   └── upload.dto.ts
│   │   │   ├── responses/
│   │   │   │   └── file.response.ts
│   │   │   ├── storage.controller.ts
│   │   │   ├── storage.service.ts
│   │   │   └── storage.module.ts
│   │   │
│   │   ├── user/
│   │   │   ├── dto/
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   └── update-user.dto.ts
│   │   │   ├── responses/
│   │   │   │   ├── user.response.ts
│   │   │   │   └── user-list.response.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   └── user.module.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── prisma/
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   │
│   ├── generated/
│   │
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── app.module.ts
│   └── main.ts
│
├── uploads/
│   └── .gitkeep
│
├── rest-client/
│
├── .env
├── .env.example
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

## Phase 1: Foundation & Configuration

**Goal**: Set up centralized configuration and restructure existing code.

### Tasks

- [ ] **1.1** Install dependencies

  ```bash
  pnpm add class-validator class-transformer @nestjs/swagger swagger-ui-express
  pnpm add @nestjs/passport passport passport-jwt @nestjs/jwt bcrypt
  pnpm add @nestjs/throttler helmet compression
  pnpm add -D @types/passport-jwt @types/bcrypt @faker-js/faker
  ```

- [ ] **1.2** Create `src/config/` folder with configuration files
  - `app.config.ts` - App name, port, environment
  - `auth.config.ts` - JWT secret, access/refresh token expiry
  - `database.config.ts` - Database URL
  - `storage.config.ts` - Storage driver (local/s3), paths, limits
  - `swagger.config.ts` - Swagger title, description, version
  - `index.ts` - Barrel export

- [ ] **1.3** Create `.env.example` with all environment variables

- [ ] **1.4** Update `main.ts` to enable:
  - Global validation pipe
  - Helmet security headers
  - Compression
  - CORS
  - Swagger documentation

- [ ] **1.5** Move existing modules to `src/modules/` folder
  - Move `src/user/` → `src/modules/user/`
  - Move `src/post/` → `src/modules/post/`
  - Update all imports

### Deliverables

- Configuration system ready
- Swagger docs at `/api/docs`
- Security headers enabled
- Existing modules restructured

---

## Phase 2: Common Module & Infrastructure

**Goal**: Create shared utilities, guards, filters, and interceptors.

### Tasks

- [ ] **2.1** Create `src/common/filters/http-exception.filter.ts`
  - Standardized error response format
  - ```json
    { "status": 400, "message": "Validation failed", "errors": [...] }
    ```

- [ ] **2.2** Create `src/common/interceptors/response.interceptor.ts`
  - Wrap all responses in standard envelope
  - ```json
    { "status": 200, "message": "Success", "data": {...} }
    ```

- [ ] **2.3** Create `src/common/interceptors/logging.interceptor.ts`
  - Log request method, URL, duration

- [ ] **2.4** Create `src/common/dto/pagination.dto.ts`
  - `page`, `limit`, `sortBy`, `sortOrder` query params

- [ ] **2.5** Create `src/common/helpers/pagination.helper.ts`
  - Prisma pagination helper function

- [ ] **2.6** Create `src/common/decorators/public.decorator.ts`
  - Mark routes as public (skip auth)

- [ ] **2.7** Create `src/common/common.module.ts`
  - Export all common utilities

- [ ] **2.8** Register global filters and interceptors in `main.ts`

### Deliverables

- Standardized API responses
- Request logging
- Pagination utilities
- Public route decorator

---

## Phase 3: Authentication Module

**Goal**: Implement JWT-based authentication with login/register.

### Tasks

- [ ] **3.1** Update Prisma schema for User (add password field)

  ```prisma
  model User {
    id        Int      @id @default(autoincrement())
    email     String   @unique
    password  String
    name      String?
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
  }
  ```

- [ ] **3.2** Create `src/common/strategies/jwt.strategy.ts`
  - Passport JWT strategy

- [ ] **3.3** Create `src/common/guards/jwt-auth.guard.ts`
  - Protect routes requiring authentication

- [ ] **3.4** Create `src/common/decorators/current-user.decorator.ts`
  - Extract current user from request

- [ ] **3.5** Create `src/modules/auth/` module
  - `dto/login.dto.ts` - Email, password validation
  - `dto/register.dto.ts` - Email, password, name validation
  - `responses/auth.response.ts` - Token response mapping
  - `auth.service.ts` - Register, login, validate, hash password
  - `auth.controller.ts` - POST /auth/login, POST /auth/register
  - `auth.module.ts`

- [ ] **3.6** Update `src/modules/user/user.service.ts`
  - Add `findByEmail()` method

- [ ] **3.7** Apply `JwtAuthGuard` globally with `@Public()` exceptions

- [ ] **3.8** Create `rest-client/auth.rest` for testing

### Deliverables

- User registration with password hashing
- JWT login with access token
- Protected routes by default
- `@Public()` decorator for open routes

---

## Phase 4: Roles & Permissions (RBAC)

**Goal**: Implement role-based access control.

### Tasks

- [ ] **4.1** Update Prisma schema for RBAC

  ```prisma
  model Role {
    id          Int              @id @default(autoincrement())
    name        String           @unique
    permissions RolePermission[]
    users       UserRole[]
  }

  model Permission {
    id    Int              @id @default(autoincrement())
    name  String           @unique
    roles RolePermission[]
  }

  model UserRole {
    userId Int
    roleId Int
    user   User @relation(fields: [userId], references: [id])
    role   Role @relation(fields: [roleId], references: [id])
    @@id([userId, roleId])
  }

  model RolePermission {
    roleId       Int
    permissionId Int
    role         Role       @relation(fields: [roleId], references: [id])
    permission   Permission @relation(fields: [permissionId], references: [id])
    @@id([roleId, permissionId])
  }
  ```

- [ ] **4.2** Run Prisma migration

- [ ] **4.3** Create `src/common/decorators/roles.decorator.ts`
  - `@Roles('admin', 'user')`

- [ ] **4.4** Create `src/common/decorators/permissions.decorator.ts`
  - `@Permissions('user:read', 'user:write')`

- [ ] **4.5** Create `src/common/guards/roles.guard.ts`

- [ ] **4.6** Create `src/common/guards/permissions.guard.ts`

- [ ] **4.7** Create `src/modules/role/` module
  - `role.service.ts` - CRUD for roles/permissions
  - `role.module.ts`

- [ ] **4.8** Update JWT strategy to include user roles/permissions

### Deliverables

- Role and permission database structure
- `@Roles()` and `@Permissions()` decorators
- Guards for role/permission checking

---

## Phase 5: User Module Enhancement

**Goal**: Complete user CRUD with DTOs and response mapping.

### Tasks

- [ ] **5.1** Create `src/modules/user/dto/create-user.dto.ts`
  - Validation for email, password, name

- [ ] **5.2** Create `src/modules/user/dto/update-user.dto.ts`
  - Partial update validation

- [ ] **5.3** Create `src/modules/user/responses/user.response.ts`
  - Exclude password, format dates

- [ ] **5.4** Create `src/modules/user/responses/user-list.response.ts`
  - Paginated user list with metadata

- [ ] **5.5** Update `src/modules/user/user.controller.ts`
  - GET /users (admin only, paginated)
  - GET /users/:id
  - GET /users/me (current user profile)
  - PUT /users/:id
  - DELETE /users/:id

- [ ] **5.6** Apply response transformation in controller

- [ ] **5.7** Update `rest-client/user.rest`

### Deliverables

- Full user CRUD with validation
- Response mapping (password excluded)
- Pagination support

---

## Phase 6: Post Module Enhancement

**Goal**: Complete post CRUD as example module.

### Tasks

- [ ] **6.1** Create `src/modules/post/dto/create-post.dto.ts`

- [ ] **6.2** Create `src/modules/post/dto/update-post.dto.ts`

- [ ] **6.3** Create `src/modules/post/responses/post.response.ts`

- [ ] **6.4** Create `src/modules/post/responses/post-list.response.ts`

- [ ] **6.5** Update `src/modules/post/post.controller.ts`
  - Apply pagination, DTOs, response mapping
  - Protect create/update/delete routes

- [ ] **6.6** Update `rest-client/post.rest`

### Deliverables

- Complete post CRUD example
- Demonstrates all starter kit patterns

---

## Phase 7: File Storage Module

**Goal**: Implement file upload with local and S3 driver support.

### Tasks

- [ ] **7.1** Install additional dependencies

  ```bash
  pnpm add @nestjs/platform-express multer
  pnpm add @aws-sdk/client-s3 @aws-sdk/lib-storage
  pnpm add -D @types/multer
  ```

- [ ] **7.2** Create `uploads/` directory with `.gitkeep`

- [ ] **7.3** Create `src/modules/storage/drivers/local.driver.ts`
  - Save file to local disk
  - Generate public URL

- [ ] **7.4** Create `src/modules/storage/drivers/s3.driver.ts`
  - Upload to S3 bucket
  - Generate signed URL

- [ ] **7.5** Create `src/modules/storage/storage.service.ts`
  - Driver abstraction (local or s3 based on config)

- [ ] **7.6** Create `src/modules/storage/storage.controller.ts`
  - POST /storage/upload (multipart)
  - DELETE /storage/:filename

- [ ] **7.7** Create `src/modules/storage/dto/upload.dto.ts`

- [ ] **7.8** Create `src/modules/storage/responses/file.response.ts`

- [ ] **7.9** Configure static file serving for `/uploads/*`

- [ ] **7.10** Create `rest-client/storage.rest`

### Deliverables

- File upload endpoint
- Local storage driver (default)
- S3 driver (prepared)
- Static file serving

---

## Phase 8: Health Check Module

**Goal**: Add health check endpoint for monitoring.

### Tasks

- [ ] **8.1** Install dependencies

  ```bash
  pnpm add @nestjs/terminus
  ```

- [ ] **8.2** Create `src/modules/health/health.controller.ts`
  - GET /health - Basic health check
  - GET /health/db - Database connectivity check

- [ ] **8.3** Create `src/modules/health/health.module.ts`

- [ ] **8.4** Mark health routes as `@Public()`

### Deliverables

- `/health` endpoint for load balancers
- Database connectivity check

---

## Phase 9: Database Seeding

**Goal**: Create factories and seeders for development data.

### Tasks

- [ ] **9.1** Create `prisma/seed/factories/user.factory.ts`
  - Generate fake users with Faker.js

- [ ] **9.2** Create `prisma/seed/factories/post.factory.ts`
  - Generate fake posts with Faker.js

- [ ] **9.3** Create `prisma/seed/seeders/role.seeder.ts`
  - Seed default roles: admin, user
  - Seed default permissions

- [ ] **9.4** Create `prisma/seed/seeders/user.seeder.ts`
  - Seed admin user
  - Seed sample users using factory

- [ ] **9.5** Create `prisma/seed/seeders/post.seeder.ts`
  - Seed sample posts using factory

- [ ] **9.6** Create `prisma/seed/seed.ts`
  - Main seeder entry point
  - Run all seeders in order

- [ ] **9.7** Update `package.json` with seed script
  ```json
  "prisma": {
    "seed": "ts-node prisma/seed/seed.ts"
  }
  ```

### Deliverables

- Faker-based factories
- Database seeders
- `pnpm prisma db seed` command

---

## Phase 10: Docker Configuration

**Goal**: Add Docker support for containerized deployment.

### Tasks

- [ ] **10.1** Create `Dockerfile`
  - Multi-stage build
  - Production-optimized

- [ ] **10.2** Create `docker-compose.yml`
  - App service
  - Database service (if needed)

- [ ] **10.3** Create `.dockerignore`

- [ ] **10.4** Update `README.md` with Docker instructions

### Deliverables

- Docker image build
- Docker Compose for local development

---

## Phase 11: Documentation & Cleanup

**Goal**: Finalize documentation and clean up.

### Tasks

- [ ] **11.1** Update `README.md`
  - Project overview
  - Quick start guide
  - Environment variables
  - API documentation link
  - Folder structure explanation

- [ ] **11.2** Add inline code comments where needed

- [ ] **11.3** Verify all REST client files work

- [ ] **11.4** Run linting and fix issues

- [ ] **11.5** Final testing of all endpoints

### Deliverables

- Complete README
- Clean, documented code
- Working starter kit

---

## Summary

| Phase | Name                           | Estimated Tasks |
| ----- | ------------------------------ | --------------- |
| 1     | Foundation & Configuration     | 5 tasks         |
| 2     | Common Module & Infrastructure | 8 tasks         |
| 3     | Authentication Module          | 8 tasks         |
| 4     | Roles & Permissions (RBAC)     | 8 tasks         |
| 5     | User Module Enhancement        | 7 tasks         |
| 6     | Post Module Enhancement        | 6 tasks         |
| 7     | File Storage Module            | 10 tasks        |
| 8     | Health Check Module            | 4 tasks         |
| 9     | Database Seeding               | 7 tasks         |
| 10    | Docker Configuration           | 4 tasks         |
| 11    | Documentation & Cleanup        | 5 tasks         |

**Total: 11 Phases, 72 Tasks**

---

## How to Use This Plan

1. We will work through each phase sequentially
2. After each phase, you can test and commit the changes
3. If you want to skip any phase, let me know
4. We can adjust the order if needed

---

**Ready to start Phase 1?**
