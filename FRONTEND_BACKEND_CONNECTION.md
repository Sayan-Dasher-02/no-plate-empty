# Frontend + Backend Connection Overview

This project has three runnable parts:

- Frontend: `no-plate-empty-frontend`
- Backend API: `no-plate-empty-backend`
- ML analytics API: `no-plate-empty-backend/app.py`

## Development Ports

Backend `.env`:

```env
PORT=5001
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<secret>
REFRESH_SECRET=<secret>
```

Frontend `.env.development`:

```env
VITE_API_BASE_URL=http://localhost:5001
VITE_ML_API_BASE_URL=http://127.0.0.1:5000
```

Vite runs on `http://localhost:5173`. Its dev proxy forwards `/api` requests to `http://localhost:5001`.

## Run Commands

Backend:

```bash
cd no-plate-empty-backend
npm run dev
```

Frontend:

```bash
cd no-plate-empty-frontend
npm run dev
```

ML analytics:

```bash
.venv\Scripts\python.exe no-plate-empty-backend\app.py
```

By default, the ML service uses a local deterministic fallback so it can run even if compiled model dependencies are unavailable. Set `ML_USE_TRAINED_MODELS=true` only after the Python ML packages and model files are working correctly.

## Production

Build the frontend:

```bash
cd no-plate-empty-frontend
npm run build
```

Start the backend with `NODE_ENV=production`. The backend serves:

```text
no-plate-empty-frontend/dist
```

## Notes

- CORS allows local development origins like `http://localhost:5173` and `http://127.0.0.1:5173`.
- The backend now fails fast if MongoDB cannot connect instead of hanging during startup.
- If MongoDB returns `bad auth : authentication failed`, update the username/password/database credentials inside `no-plate-empty-backend/.env`.
