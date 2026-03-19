# Frontend + Backend Connection Overview

This document explains how the React frontend is connected to the Express backend in this project, what was changed, and why those changes matter.

## Goal
Make frontend API calls work cleanly in both development and production.

## 1. API Base URL (Frontend)
**File:** `no-plate-empty-main/Frontend/src/lib/api.ts`

**Purpose:** Single source of truth for API base URL.

```ts
export const API = import.meta.env.VITE_API_BASE_URL ?? "";
```

**Why:**  
- In dev, API base is `http://localhost:5000`.  
- In prod, frontend and backend share the same origin, so base can be empty.

## 2. Environment Files (Frontend)
**Files:**  
- `no-plate-empty-main/Frontend/.env`  
- `no-plate-empty-main/Frontend/.env.development`

**Values:**
```
# .env.development
VITE_API_BASE_URL=http://localhost:5000
```

```
# .env
VITE_API_BASE_URL=
```

**Why:**  
Separate dev vs production configuration without touching code.

## 3. Vite Proxy (Dev Only)
**File:** `no-plate-empty-main/Frontend/vite.config.ts`

**Added block:**
```ts
server: {
  host: "::",
  port: 8080,
  proxy: {
    "/api": {
      target: "http://localhost:5000",
      changeOrigin: true,
    },
  },
},
```

**Why:**  
Frontend can call `/api/...` directly and Vite forwards it to backend. This avoids CORS issues in development.

## 4. CORS Configuration (Backend)
**File:** `noplate-empty-backend/app.js`

**Important section:**
```js
const allowedOrigins = ["http://localhost:8080", "http://127.0.0.1:8080"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (process.env.NODE_ENV === "production") return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
```

**Why:**  
Browser blocks cross-origin calls by default. This allows requests from the frontend dev server.

## 5. Serve Frontend Build in Production
**File:** `noplate-empty-backend/app.js`

**Added block:**
```js
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(
    __dirname,
    "..",
    "no-plate-empty-main",
    "Frontend",
    "dist"
  );

  app.use(express.static(clientBuildPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}
```

**Why:**  
In production, the backend serves the React build so both run on a single domain.

## 6. Donor Register Fix
**File:** `no-plate-empty-main/Frontend/src/pages/DonorRegister.tsx`

**Fix:**
```ts
body: JSON.stringify({
  name,
  email,
  password,
  role: "DONOR",
}),
```

**Why:**  
Backend requires `role`. Without it, registration returns 400.

## 7. Login Response Alignment
**File:** `no-plate-empty-main/Frontend/src/pages/LoginPage.tsx`

**Fix:**
```ts
switch (data.role) {
  case "DONOR":
    navigate("/donor/dashboard");
    break;
  case "NGO":
    navigate("/ngo/dashboard");
    break;
  case "SUPER_ADMIN":
    navigate("/super-admin/dashboard");
    break;
}
```

**Why:**  
Backend returns `role` directly (not `user.role`).

## Quick Run Commands

### Development
Backend:
```
cd noplate-empty-backend
npm run dev
```

Frontend:
```
cd no-plate-empty-main/Frontend
npm run dev
```

### Production
Build frontend:
```
cd no-plate-empty-main/Frontend
npm run build
```

Start backend:
```
cd noplate-empty-backend
npm start
```

