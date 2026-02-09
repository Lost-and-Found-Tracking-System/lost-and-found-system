# Lost & Found System

A full-stack web application for managing lost and found items on campus. Users can report lost or found items, browse listings, and submit claims. Administrators have access to dashboards for managing users, zones, and claims.

---

## Quick Start

```bash
# Clone repository
git clone <repository-url>
cd lost-and-found-system

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Environment setup
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Run application (two terminals)
cd backend && npm run dev
cd frontend && npm run dev
```

**Frontend**: http://localhost:5173  
**Backend**: http://localhost:5000

---

## Table of Contents

- [Quick Start](#quick-start)
- [Overview](#overview)
- [Application URLs](#application-urls)
- [Running the Application](#running-the-application)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Environment Variables](#environment-variables)
  - [Backend Configuration](#backend-configuration)
  - [Frontend Configuration](#frontend-configuration)
- [Testing](#testing)
  - [Backend Tests](#backend-tests)
  - [Frontend Tests](#frontend-tests)
  - [End-to-End Tests](#end-to-end-tests)
- [Database Seeding](#database-seeding)
- [API Overview](#api-overview)
- [Development Guidelines](#development-guidelines)
- [Important Notes](#important-notes)

---

## Overview

Lost & Found is a full-stack web application built with React (frontend) and Node.js/Express (backend) that helps users report and find lost items on campus.

---

## Application URLs

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

---

## Running the Application

Start both servers in separate terminals.

### Backend

```bash
cd backend
npm run dev
```

The backend server runs on **http://localhost:5000**.

### Frontend

```bash
cd frontend
npm run dev
```

The frontend application is available at **http://localhost:5173**.

---

## Environment Variables

### Backend Configuration

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lostfound
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:5173
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=no-reply@example.com
```

### Frontend Configuration

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Testing

### Backend Tests

Run unit and integration tests using Vitest:

```bash
cd backend
npm test
npm run test:watch
npm run test:coverage
```

### Frontend Tests

Run component tests using Vitest and React Testing Library:

```bash
cd frontend
npm test
```

### End-to-End Tests

Run Playwright tests (ensure frontend and backend are running):

```bash
cd e2e
npx playwright test
npx playwright test --ui
npx playwright show-report
```

---

## Database Seeding

Populate the database with initial data such as an admin user:

```bash
cd backend
npx tsx src/scripts/seed-users.ts
```

**Default admin credentials:**
- Email: `admin@example.com`
- Password: `Admin@123`

---

## API Overview

Common API endpoints:

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/items` - Get all items
- `POST /api/v1/items` - Create a new item
- `GET /api/v1/claims` - Get all claims

For full API definitions, see `backend/src/routes`.

---

## Development Guidelines

- Create feature branches from `main` or `develop`
- Use clear and meaningful commit messages
- Ensure all tests pass before merging
- Follow ESLint and Prettier rules
- Use functional React components and hooks
- Keep backend services free of HTTP-specific logic

---

## Important Notes

- MongoDB must be running locally or accessible via Atlas
- Redis is required if Bull job queues are enabled
- Environment variables should **never** be committed to version control
- Always use `.env.example` files to document required environment variables

---

## Quick Start Checklist

- [ ] Install dependencies: `npm install` in both `frontend/` and `backend/`
- [ ] Set up MongoDB (local or Atlas)
- [ ] Create `.env` files in both directories
- [ ] Seed the database with initial data
- [ ] Start backend server: `cd backend && npm run dev`
- [ ] Start frontend server: `cd frontend && npm run dev`
- [ ] Access the application at http://localhost:5173

---

## Troubleshooting

### Common Issues

**Backend won't start:**
- Verify MongoDB is running
- Check that all environment variables are set correctly
- Ensure port 5000 is not already in use

**Frontend won't connect to backend:**
- Verify `VITE_API_URL` in frontend `.env` is correct
- Check that the backend server is running
- Clear browser cache and restart dev server

**Database connection errors:**
- Verify MongoDB connection string in `MONGODB_URI`
- Check MongoDB service is running
- Ensure database user has proper permissions

---

## Project Structure

```
lost-found/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── scripts/
│   ├── tests/
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── .env
└── e2e/
    └── tests/
```

---

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)

---
