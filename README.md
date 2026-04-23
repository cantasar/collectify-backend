# Collectify Backend

Simple and clean REST API for personal collections and items.

## Table of Contents

- [Overview](#overview)
- [Live API](#live-api)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Run Locally](#run-locally)
- [Local Register and Login](#local-register-and-login)
- [API Endpoints](#api-endpoints)
- [Example Requests (curl)](#example-requests-curl)
- [Response and Error Format](#response-and-error-format)
- [Design Notes](#design-notes)

## Overview

I built this backend with Firebase Cloud Functions and Express.

It lets users create collections and manage items inside those collections.

Each user only sees and edits their own data.

## Live API

- Base URL: `https://api-dpqkhyr4va-uc.a.run.app`
- Swagger UI: `https://api-dpqkhyr4va-uc.a.run.app/docs`
- OpenAPI JSON: `https://api-dpqkhyr4va-uc.a.run.app/docs/openapi.json`

## Tech Stack

- Node.js 22
- TypeScript (strict mode)
- Express 5
- Firebase Cloud Functions v2
- Firestore (Admin SDK)
- Firebase Authentication
- Zod validation
- express-rate-limit
- Swagger UI (OpenAPI)
- ESLint
- Prettier
- Husky + lint-staged

## Project Structure

All backend code is under `functions/src`.

```text
routes/         Route definitions
controllers/    Request handlers
services/       Business logic
repositories/   Firestore operations
schemas/        Zod validation schemas
middleware/     Auth, validation, rate limit, error handling
config/         Firebase setup and constants
docs/           OpenAPI document
types/ utils/   Shared types and utility helpers
```

## Authentication

All endpoints require Firebase ID token except:

- `/health`
- `/docs`

<br>

Use this header on protected endpoints:

```http
Authorization: Bearer <ID_TOKEN>
```

I used Firebase Authentication with Email/Password.
Use the register and login scripts below to get an idToken.

Testers must put the Firebase API key into the request URL.

I shared the <b> API key </b> with testers by email.

### Register (Production)

```bash
curl -X POST \
  "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=API_KEY_SHARED_IN_MAIL" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "can@gmail.com",
    "password": "123456",
    "returnSecureToken": true
  }'
```

### Login (Production)

```bash
curl -X POST \
  "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=API_KEY_SHARED_IN_MAIL" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "can@gmail.com",
    "password": "123456",
    "returnSecureToken": true
  }'
```

Take `idToken` from the response and use on Swagger or in curl scripts.

## Run Locally

### Prerequisites

- Firebase CLI installed
- Firebase project with Firestore and Email/Password auth enabled

### Start local environment

From project root:

```bash
firebase login
firebase use collectify-72d86
cd functions
npm install
npm run build
cp .secret.local.example .secret.local
cd ..
firebase emulators:start
```

`cp .secret.local.example .secret.local` creates the real local secrets file from the example file.

Local API base URL:

```text
http://127.0.0.1:5001/collectify-72d86/us-central1/api
```

## Local Register and Login

For local auth tests, use Auth Emulator REST endpoint.
You still need to pass `key=YOUR_API_KEY` in the URL.

Set variables:

```bash
API_KEY="dummy-api-key-for-local"
AUTH_EMULATOR_URL="http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1"
LOCAL_BASE_URL="http://127.0.0.1:5001/collectify-72d86/us-central1/api"
```

### Register (Local)

```bash
curl -X POST \
  "$AUTH_EMULATOR_URL/accounts:signUp?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "can@gmail.com",
    "password": "123456",
    "returnSecureToken": true
  }'
```

### Login (Local)

```bash
curl -X POST \
  "$AUTH_EMULATOR_URL/accounts:signInWithPassword?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "can@gmail.com",
    "password": "123456",
    "returnSecureToken": true
  }'
```

Set token:

```bash
TOKEN="<idToken_from_login_response>"
```

Now call local protected endpoints with:

```bash
-H "Authorization: Bearer $TOKEN"
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Returns API status and `serviceId` |
| GET | `/docs` | No | Swagger UI |
| POST | `/collections` | Yes | Create collection |
| GET | `/collections` | Yes | List user collections |
| GET | `/collections/:id` | Yes | Get collection with paginated items |
| PUT | `/collections/:id` | Yes | Update collection |
| DELETE | `/collections/:id` | Yes | Delete collection and its items |
| POST | `/collections/:collectionId/items` | Yes | Add item |
| GET | `/collections/:collectionId/items` | Yes | List items |
| PUT | `/collections/:collectionId/items/:itemId` | Yes | Update item |
| DELETE | `/collections/:collectionId/items/:itemId` | Yes | Delete item |

Main validation rules:

- Collection name is required, max 100 chars, unique per user
- Max 20 collections per user
- Item title is required, min 3 and max 100 chars
- Item priority: `low`, `medium`, `high` (default: `medium`)
- `url` and `imageUrl` must be valid URL if provided
- Max 20 tags per item

## Example Requests (curl)

Set production variables:

```bash
BASE_URL="https://api-dpqkhyr4va-uc.a.run.app"
TOKEN="<idToken>"
```

Health check:

```bash
curl "$BASE_URL/health"
```

Create collection:

```bash
curl -X POST "$BASE_URL/collections" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Reading List",
    "description": "Articles to read later"
  }'
```

List collections:

```bash
curl "$BASE_URL/collections" \
  -H "Authorization: Bearer $TOKEN"
```

Get one collection:

```bash
curl "$BASE_URL/collections/<collectionId>" \
  -H "Authorization: Bearer $TOKEN"
```

Update collection:

```bash
curl -X PUT "$BASE_URL/collections/<collectionId>" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "description": "Updated description"
  }'
```

Delete collection:

```bash
curl -X DELETE "$BASE_URL/collections/<collectionId>" \
  -H "Authorization: Bearer $TOKEN"
```

Add item:

```bash
curl -X POST "$BASE_URL/collections/<collectionId>/items" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "How to design REST APIs",
    "content": "Notes",
    "url": "https://example.com",
    "imageUrl": "https://example.com/image.png",
    "tags": ["api", "backend"],
    "priority": "high"
  }'
```

List items:

```bash
curl "$BASE_URL/collections/<collectionId>/items" \
  -H "Authorization: Bearer $TOKEN"
```

Update item:

```bash
curl -X PUT "$BASE_URL/collections/<collectionId>/items/<itemId>" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "priority": "low"
  }'
```

Delete item:

```bash
curl -X DELETE "$BASE_URL/collections/<collectionId>/items/<itemId>" \
  -H "Authorization: Bearer $TOKEN"
```

## Response and Error Format

All request and response fields use camelCase.

Success response examples:

- List collections: `{ "collections": [...], "meta": {...} }`
- List items: `{ "items": [...], "meta": {...} }`

Error response format:

```json
{
  "error": {
    "code": "COLLECTION_NAME_TAKEN",
    "message": "A collection with this name already exists"
  }
}
```

Validation errors include `details`:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "title", "message": "Title must be at least 3 characters" }
    ]
  }
}
```

Common status codes:

- `200` OK
- `201` Created
- `204` No Content
- `400` Validation error
- `401` Unauthorized
- `404` Not found
- `409` Conflict
- `429` Rate limit exceeded

## Design Notes

- Single Cloud Function with one Express app
- Layered architecture for clean separation of concerns
- Per-user authorization checks in service layer
- Collection name uniqueness and limit checks
- Cascade delete for collection -> items
- Zod-based request validation
- Basic rate limiting
- OpenAPI docs at `/docs`
