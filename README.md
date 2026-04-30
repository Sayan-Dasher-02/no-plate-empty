# No Plate Empty

No Plate Empty is a food redistribution platform that connects hostel or campus food donors with NGOs and recipient organizations. The project helps donors publish surplus food, recipients browse and request available food, and admins approve or reject registered users.

The repository contains a React frontend, an Express/MongoDB backend, and a Python Flask ML analytics service for demand and surplus forecasting.

## Features

- Donor and NGO registration/login
- Super admin approval flow for new users
- Donor dashboard for managing food items, categories, profile details, incoming orders, and analytics
- NGO dashboard for browsing food, viewing donors, and tracking order history
- JWT-based authentication with protected routes
- MongoDB persistence through Mongoose models
- ML analytics endpoint for predicted demand, recommended cooking quantity, and surplus risk
- Render deployment configuration for frontend, backend, and ML services

## Tech Stack

**Frontend**

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui and Radix UI
- React Router
- TanStack Query

**Backend**

- Node.js
- Express
- MongoDB and Mongoose
- JWT authentication
- bcrypt password hashing

**ML Service**

- Python
- Flask
- scikit-learn
- pandas
- gunicorn

## Project Structure

```text
.
|-- no-plate-empty-frontend/     # React/Vite client app
|-- no-plate-empty-backend/      # Express API and Flask ML service
|   |-- controllers/             # API business logic
|   |-- models/                  # Mongoose schemas
|   |-- routes/                  # Express routes
|   |-- middleware/              # Auth and role middleware
|   |-- ml/                      # ML model files and scripts
|   |-- docs/postman/            # Postman collection and environment
|   |-- app.js                   # Express app setup
|   |-- server.js                # Express server entrypoint
|   `-- app.py                   # Flask ML service entrypoint
|-- render.yaml                  # Render deployment blueprint
`-- README.md
```

## Prerequisites

- Node.js 24 or a compatible recent Node.js version
- npm
- Python 3.10+
- MongoDB Atlas or a local MongoDB instance

## Environment Variables

Create a `.env` file inside `no-plate-empty-backend/`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REFRESH_SECRET=your_refresh_secret
PORT=5001
FRONTEND_ORIGINS=http://localhost:8080,http://localhost:5173
MONGO_CONNECT_TIMEOUT_MS=10000
```

For seeding the super admin, also set:

```env
ADMIN_NAME=Super Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password
RESET_EXISTING_SUPER_ADMINS=false
```

Create a `.env` file inside `no-plate-empty-frontend/` if you want to override API URLs:

```env
VITE_API_BASE_URL=http://localhost:5001
VITE_ML_API_BASE_URL=http://localhost:5000
```

If `VITE_API_BASE_URL` is not set in development, the frontend uses relative API paths.

## Installation

Install backend dependencies:

```bash
cd no-plate-empty-backend
npm install
```

Install frontend dependencies:

```bash
cd no-plate-empty-frontend
npm install
```

Install ML service dependencies:

```bash
cd no-plate-empty-backend
pip install -r ml/requirements.txt
```

## Running Locally

Start the backend API:

```bash
cd no-plate-empty-backend
npm run dev
```

The backend runs on:

```text
http://localhost:5001
```

Start the frontend:

```bash
cd no-plate-empty-frontend
npm run dev
```

The frontend runs on the Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

Start the ML analytics service:

```bash
cd no-plate-empty-backend
python app.py
```

The ML service exposes:

```text
GET  /health
POST /analytics
```

## Useful Scripts

Backend:

```bash
npm run dev         # Start backend with nodemon
npm start           # Start backend with node
npm run seed:admin  # Create or update the super admin account
```

Frontend:

```bash
npm run dev       # Start Vite dev server
npm run build     # Build production frontend
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

## API Overview

Main backend endpoints include:

```text
GET    /api/health
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PATCH  /api/auth/me
PATCH  /api/auth/reset-password
POST   /api/auth/logout
DELETE /api/auth/me
GET    /api/admin/pending-users
PATCH  /api/admin/approve/:id
PATCH  /api/admin/reject/:id
```

Additional food, donor, and category routes are mounted under:

```text
/api/v1/food
/api/v1/Doner
/api/v1/category
```

Postman files are available in:

```text
no-plate-empty-backend/docs/postman/
```

## Deployment

The repository includes `render.yaml` with three Render services:

- `no-plate-empty-backend` for the Express API
- `no-plate-empty-ml` for the Flask ML service
- `no-plate-empty-frontend` for the static React build

Set production secrets such as `MONGO_URI`, `JWT_SECRET`, `REFRESH_SECRET`, and `VITE_ML_API_BASE_URL` in Render before deploying.

## License

This project is for academic and educational use.
