# Lost & Found System - DevDocs

## Quick Start
```bash
# 1. Clone & install
git clone &lt;repo&gt; && cd lost-and-found-system
cd backend && npm install && cd ../frontend && npm install

# 2. Configure
cp backend/.env.example backend/.env  # Edit with your values
cp frontend/.env.example frontend/.env

# 3. Run (two terminals)
cd backend && npm run dev
cd frontend && npm run dev  # New terminal

App runs at http://localhost:5173
```

This document provides a comprehensive guide for developers working on the Lost & Found System. It covers the architecture, technology stack, directory structure, setup instructions, and development workflows.

## 1. Project Overview

The Lost & Found System is a full-stack web application designed to manage lost and found items on campus. It allows students, faculty, and visitors to report lost or found items, browse existing reports, and submit claims. Administrators have a dashboard for managing zones, users, and claims.

## 2. Architecture

The application follows a **Layered Architecture** (specifically the Controller-Service-Repository pattern), ensuring separation of concerns and maintainability.

### Backend Layers

1.  **Presentation Layer (Routes & Middleware)**
    -   **Routes**: Define API endpoints (`src/routes`).
    -   **Middleware**: Handles cross-cutting concerns like Authentication (`authMiddleware`), Validation (`validateRequest`), and Error Handling (`errorHandler`).
    -   **Controller Logic**: Implemented directly within route handlers (or separate controllers). responsible for parsing requests, invoking services, and sending responses.

2.  **Business Logic Layer (Services)**
    -   Encapsulates core business rules (`src/services`).
    -   Examples: `authService` (handles login/register logic), `itemService` (manages lost/found items).
    -   Decoupled from HTTP specifics (req/res objects).

3.  **Data Access Layer (Models)**
    -   Defines data structure using **Mongoose** schemas (`src/models`).
    -   Interacts directly with the **MongoDB** database.
    -   Includes schema validation and pre/post hooks.

### Data Flow

```mermaid
graph TD
    Client[Client (Frontend)] -->|HTTP Request| Middleware[Middleware (Auth/Validation)]
    Middleware -->|Valid Request| Route[Route Handler]
    Route -->|Call Method| Service[Service Layer]
    Service -->|Query/Save| Model[Mongoose Model]
    Model -->|Read/Write| DB[(MongoDB)]
    
    subgraph Backend
    Middleware
    Route
    Service
    Model
    end
```

## 3. Technology Stack

### Frontend
-   **Framework**: [React](https://react.dev/) (v18)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Language**: JavaScript (JSX)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Animation**: [GSAP](https://gsap.com/), [Framer Motion](https://www.framer.com/motion/)
-   **State Management**: React Context API
-   **Routing**: [React Router](https://reactrouter.com/)
-   **HTTP Client**: [Axios](https://axios-http.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Testing**: [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/)

### Backend
-   **Runtime**: [Node.js](https://nodejs.org/)
-   **Framework**: [Express](https://expressjs.com/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Database ODM**: [Mongoose](https://mongoosejs.com/)
-   **Authentication**: JSON Web Tokens (JWT), Argon2 (hashing)
-   **File Storage**: [Multer](https://github.com/expressjs/multer) (local/cloud)
-   **Validation**: [Zod](https://zod.dev/)
-   **Job Queue**: [Bull](https://github.com/OptimalBits/bull) (Redis based)
-   **Email**: [SendGrid](https://sendgrid.com/) / Backend Mailer
-   **PDF Generation**: [PDFKit](https://pdfkit.org/)
-   **Testing**: [Vitest](https://vitest.dev/), [Supertest](https://github.com/ladjs/supertest)

### E2E Testing
-   **Framework**: [Playwright](https://playwright.dev/)

## 4. Directory Structure

The project is organized as a monorepo with distinct directories for backend, frontend, and end-to-end tests.

```
lost-and-found-system/
├── backend/                # Backend API Server
│   ├── src/
│   │   ├── config/         # Configuration (DB, env, etc.)
│   │   ├── middleware/     # Custom middleware (auth, error handling)
│   │   ├── models/         # Mongoose schemas/models
│   │   ├── routes/         # API route definitions
│   │   ├── schemas/        # Zod validation schemas
│   │   ├── scripts/        # Utility scripts (e.g., seeding)
│   │   ├── services/       # Business logic layer
│   │   ├── tests/          # Unit and integration tests
│   │   ├── utils/          # Helper functions
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # Frontend React Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context providers (AuthContext)
│   │   ├── effects/        # Animation/Visual effects
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Application pages/routes
│   │   ├── services/       # API integration services
│   │   ├── tests/          # Component tests
│   │   ├── App.jsx         # Main application component
│   │   └── main.jsx        # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── e2e/                    # End-to-End Tests
│   ├── fixtures/           # Test fixtures
│   ├── page-objects/       # Page Object Model classes
│   ├── tests/              # Test specifications (*.spec.ts)
│   ├── package.json
│   └── playwright.config.ts
└── README.md               # Quick start guide
```

## 5. Setup & Installation

### Prerequisites
-   **Node.js**: v18 or higher
-   **MongoDB**: Running locally or via Atlas connection URI
-   **Redis**: Required for Bull queue (if background jobs are enabled)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd lost-and-found-system
    ```

2.  **Install Backend Dependencies:**
    ```bash
    cd backend
    npm install
    ```

3.  **Install Frontend Dependencies:**
    ```bash
    cd ../frontend
    npm install
    ```

4.  **Install E2E Dependencies (Optional):**
    ```bash
    cd ../e2e
    npm install
    npx playwright install  # Install browser binaries
    ```

### Environment Configuration

#### Backend (.env)
Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lostfound
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_token_secret
# Email Configuration (SendGrid or similar)
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=no-reply@example.com
# Client URL for CORS
CLIENT_URL=http://localhost:5173
```

#### Frontend (.env)
Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## 6. Running the Application

### Development Mode

You need to run both backend and frontend servers concurrently.

**Backend:**
```bash
cd backend
npm run dev
# Server starts on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm run dev
# App accessible at http://localhost:5173
```

### Seeding Data (Optional)

To populate the database with initial data (e.g., admin user):

```bash
cd backend
npx tsx src/scripts/seed-users.ts
```
**Default Admin Credentials:**
-   Email: `admin@example.com`
-   Password: `Admin@123`

## 7. Testing

### Backend Tests
Run unit and integration tests using Vitest.
```bash
cd backend
npm test            # Run all tests
npm run test:watch  # Watch mode
npm run test:coverage # Generate coverage report
```

### Frontend Tests
Run component tests using Vitest and React Testing Library.
```bash
cd frontend
npm test
```

### End-to-End (E2E) Tests
Run browser automation tests using Playwright.
```bash
cd e2e
npx playwright test        # Run all tests in headless mode
npx playwright test --ui   # Run with UI mode
npx playwright show-report # View HTML report
```

Ensure both backend and frontend servers are running before executing E2E tests, unless Playwright is configured to start them automatically.

## 8. Development Guidelines

### Git Workflow
-   Create feature branches from `main` or `develop`.
-   Use meaningful commit messages.
-   Ensure all tests pass before merging.

### Code Style
-   **Backend**: Adhere to ESLint and Prettier configurations. TypeScript is strict.
-   **Frontend**: Follow React best practices (functional components, hooks). Tailwind classes should be organized.

## 9. API Documentation

Detailed API documentation can be found in the backend routes or generated via tools like Swagger (if integrated). Key endpoints include:

-   `POST /api/v1/auth/register`
-   `POST /api/v1/auth/login`
-   `GET /api/v1/items`
-   `POST /api/v1/items`
-   `GET /api/v1/claims`

See `backend/src/routes` for full route definitions.
