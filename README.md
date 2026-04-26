# NestJS API Project

Monorepo-style project currently focused on one backend app (`api/`) built with NestJS + Prisma + PostgreSQL.

## Project scope

- **Root**: project docs and repository metadata
- **App**: `api/` (NestJS API)
- **Current domain**: users (CRUD + permission checks in use cases)

## Architecture 

The API is organized by layers inside `api/src/modules/.`:

1. **Domain**: entities/value objects + repository contracts
2. **Application**: use cases (business rules)
3. **Infrastructure**: Prisma repository implementation
4. **Presentation**: HTTP controller + DTOs
5. **Shared**: database and crypto services/modules

Flow:

`HTTP Controller -> Use Case -> Repository Abstraction -> Prisma Repository -> PostgreSQL`

## Main structure

```text
NestJS_API_Project/
|-- README.md
`-- api/
    |-- package.json
    |-- prisma.config.ts
    |-- prisma/
    |   |-- schema.prisma
    |   `-- migrations/
    `-- src/
        |-- main.ts
        |-- app.module.ts
        |-- modules/./
        |   |-- module.ts
        |   |-- presenters/http/.http.ts
        |   |-- presenters/dtos/.dto.ts
        |   |-- application/use-cases/.use-case.ts
        |   |-- domain/entities/.entity.ts
        |   |-- domain/repositories/.repository.ts
        |   `-- infrastructure/repositories/prisma.repository.ts
        `-- shared/
            |-- database/prisma.service.ts
            `-- infrastructure/crypto/hash.service.ts
```

## Tech stack

- NestJS 11 (Express platform)
- Prisma 7 (`@prisma/client`, `@prisma/adapter-pg`)
- PostgreSQL
- Swagger (`/api`)
- class-validator + class-transformer
- Argon2 (password hashing with pepper)
- Jest + ESLint + Prettier

## Setup and run

From repository root:

```bash
cd api
npm install
npx prisma migrate dev
npx prisma generate
npm run start:dev
```

Default URLs:

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api`

## Environment variables (`api/.env`)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
PEPPER=local-development-pepper
```


| Variable       | Required | Default fallback                                         | Purpose                                     |
| -------------- | -------- | -------------------------------------------------------- | ------------------------------------------- |
| `DATABASE_URL` | No       | `postgresql://postgres:postgres@localhost:5432/postgres` | PostgreSQL connection string                |
| `PEPPER`       | No       | `local-development-pepper`                               | Extra secret added before hashing passwords |


If missing, the app uses fallbacks and logs warnings.

## Database models 

### `Users`

`Role` enum:

- `USER`
- `ADMIN`

`users` table:


| Column      | Type           | Notes              |
| ----------- | -------------- | ------------------ |
| `id`        | `TEXT`         | Primary key (UUID) |
| `name`      | `TEXT NULL`    | Optional           |
| `email`     | `TEXT`         | Unique             |
| `password`  | `TEXT NULL`    | Optional           |
| `googleId`  | `TEXT NULL`    | Unique, optional   |
| `role`      | `Role`         | Default `USER`     |
| `createdAt` | `TIMESTAMP(3)` | Default now        |
| `updatedAt` | `TIMESTAMP(3)` | Auto-updated       |


## API reference

Base path: `/users`


| Method   | Endpoint            | Description    | Body                           | Success |
| -------- | ------------------- | -------------- | ------------------------------ | ------- |
| `POST`   | `/users/create`     | Create user    | `email`, `password`, `name?`   | `201`   |
| `GET`    | `/users/getAll`     | List users     | -                              | `200`   |
| `GET`    | `/users/get/:id`    | Get user by ID | -                              | `200`   |
| `PUT`    | `/users/update/:id` | Update user    | `email?`, `password?`, `name?` | `200`   |
| `DELETE` | `/users/delete/:id` | Delete user    | -                              | `204`   |


### Validation and rules

- Email must be valid
- Password must be at least 12 chars and include uppercase, lowercase, number, and special character
- Email uniqueness is enforced in create/update use cases
- IDs are generated as UUIDs
- Permission rule for update/delete:
  - requester is `ADMIN`, or
  - requester is the target user

## Scripts (`api/`)


| Command              | Purpose              |
| -------------------- | -------------------- |
| `npm run start:dev`  | Run in watch mode    |
| `npm run build`      | Build project        |
| `npm run start:prod` | Run compiled app     |
| `npm run lint`       | Run ESLint (`--fix`) |
| `npm run test`       | Unit tests           |
| `npm run test:e2e`   | E2E tests            |


## Author

[jpedropraf](https://github.com/jpedropraf)