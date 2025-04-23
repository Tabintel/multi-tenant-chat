# Building a Production-Ready Multi-Tenant Chat System with Go, Stream, and Next.js

## Introduction

This guide shows how to build and operate a **production-ready, multi-tenant chat system** using Go for the backend, Stream Chat for real-time messaging, PostgreSQL for persistence, and Next.js for the frontend. You'll learn how to connect the frontend to the backend, onboard organizations and users, and use the Stream Chat SDK for scalable chat.

---

## Architecture Overview

```mermaid
graph TD
    A[Frontend (Next.js)] -->|REST/JSON| B(Go Backend)
    B -->|GORM| C[(PostgreSQL)]
    B -->|SDK/API| D((Stream Chat))
    D --> E{Tenants}
    E --> F[Tenant A]
    E --> G[Tenant B]
    E --> H[Tenant C]
    B --> I[Authentication]
    B --> J[Role-Based Access Control]
```

- **Frontend:** Next.js + Stream Chat React SDK
- **Go Backend:** Handles auth, tenants, users, channels, and proxies chat actions to Stream
- **Stream Chat:** Real-time, scalable chat infrastructure
- **PostgreSQL:** User, tenant, and channel management

---

## 1. Backend: Go + Stream Chat SDK

### Key Features
- JWT authentication (secure, HTTP-only cookies)
- Multi-tenant support (each user belongs to a tenant)
- RESTful endpoints for auth, tenants, channels, users
- Stream Chat token endpoint (for frontend to connect securely)
- GORM/PostgreSQL for persistence
- Automated Swagger/OpenAPI docs
- Environment variable support for all secrets

### Adding Swagger Docs
- Add `github.com/swaggo/gin-swagger` and `github.com/swaggo/files` to your Go modules.
- Annotate your handlers with Swagger comments.
- Serve docs at `/swagger/index.html`:

```go
import (
    ginSwagger "github.com/swaggo/gin-swagger"
    swaggerFiles "github.com/swaggo/files"
)
r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
```

---

## 2. Onboarding Organizations & Users

- **Create Tenant:** Admins can POST to `/tenants` to onboard a new organization.
- **Create User:** Admins/Moderators POST to `/users` with tenant ID, role, email, password. Users are created in both the DB and Stream Chat via the Go SDK.
- **RBAC:** Roles enforced in backend and UI.

---

## 3. Connecting Next.js Frontend to Go Backend

### Backend Endpoints
- `/auth/login` — Authenticate and receive JWT
- `/stream/token` — Get Stream Chat token (authenticated)
- `/tenants` — CRUD for organizations
- `/users` — CRUD for users
- `/channels` — CRUD for channels

### Example: Fetching Stream Chat Token in Next.js
```ts
// lib/api.ts
export async function getStreamToken() {
  const res = await fetch('/api/stream/token', { credentials: 'include' });
  const data = await res.json();
  return data.token;
}
```

### Example: Using Stream Chat React SDK
```tsx
import { StreamChat } from 'stream-chat';
import { Chat, Channel, ChannelHeader, MessageList, MessageInput } from 'stream-chat-react';

const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!);
client.connectUser({ id: userId, name: userName }, streamToken);

<Chat client={client}>
  <Channel channel={activeChannel}>
    <ChannelHeader />
    <MessageList />
    <MessageInput />
  </Channel>
</Chat>
```

### Example: Onboarding a New Organization
```bash
curl -X POST https://your-backend/tenants \
  -H 'Authorization: Bearer <JWT>' \
  -d '{"name": "Acme Corp"}'
```

---

## 4. Security & Production Readiness
- All secrets in environment variables
- JWT auth with secure cookies
- CSRF protection and input validation
- RBAC enforced in backend and UI
- Linting, formatting, and type safety

---

## 5. API Documentation & Onboarding
- Visit `/swagger/index.html` for live API docs (auto-generated)
- See `/docs/api.md` for endpoint contracts
- See `/docs/stream-integration.md` for Stream setup
- See `/docs/multi-tenancy.md` for tenant logic

---

## 6. Extending to V2/V3
- V2: Add Stream Video for video calls
- V3: Integrate AI-powered voice transcription

---

## Conclusion

You now have a robust, production-ready multi-tenant chat system. The backend is secure, scalable, and integrated with Stream Chat. The frontend connects seamlessly via REST and the Stream SDK. Onboard organizations and users, and you’re ready for real-time chat at scale!
