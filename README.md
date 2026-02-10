# Lost & Found Tracking System

**AI-powered Lost and Found tracking system with automated matching, claim verification, and real-time notifications for campus management.**

Built for **Amrita Vishwa Vidyapeetham** campus — helps students, faculty, and visitors report lost/found items, get AI-powered match suggestions, submit ownership claims, and receive real-time notifications.

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Repository Structure](#-repository-structure)
- [Quick Start](#-quick-start)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Running the Application](#running-the-application)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [AI/ML Pipeline](#-aiml-pipeline)
- [Testing](#-testing)
- [UML Diagrams](#-uml-diagrams)
- [Multi-Repo Structure](#-multi-repo-structure)
- [Team](#-team)
- [License](#-license)

---

## Features

### Sprint 1 — Fully Integrated (Backend + API + Frontend)

| Module | Feature | Details |
|--------|---------|---------|
| **Authentication** | JWT-based auth (access + refresh tokens), Argon2 password hashing | Login, register, token refresh, session management with device tracking |
| **OTP Verification** | Redis-backed OTP for visitor registration & password reset | SMS via Fast2SMS, email via SendGrid, rate limiting, TTL expiry |
| **Item Reporting** | Report lost/found items with category, location, images, time metadata | Multi-step form with campus zone validation, draft auto-save |
| **Image Upload** | Cloudinary-based image upload with transformations | Single & multi-image upload (max 5), 5MB limit, image-only filter |
| **Campus Zones** | GeoJSON-based campus zone management with 2dsphere indexing | Admin CRUD, polygon geo-boundaries, zone validation on item submission |
| **Claim System** | Submit ownership claims with proof, admin review & approval workflow | Proof text + image evidence, confidence tiers, withdraw support |
| **Notifications** | In-app, email (SendGrid), and SMS (Fast2SMS) notifications with user preferences | Priority-based routing, type-specific icons, mark read/delete, preference controls |
| **Admin Dashboard** | User management, claim resolution, audit logs, announcements | Live activity feed, role changes, stats counters, AI config panel |
| **Role-Based Access** | 5 roles — student, faculty, visitor, admin, delegated_admin | Scope-based permissions, visitor auto-expiry via TTL index |
| **Background Jobs** | Bull queue + node-cron for data retention, reminders, escalation | Graceful Redis fallback, email/SMS queue processing |
| **Draft Saving** | Auto-save item submission drafts | Per-user draft persistence with CRUD |
| **Premium UI** | 39+ GSAP & Framer Motion effects | Holographic cards, particle cursors, aurora backgrounds, morphing blobs, tilt cards |

### Sprint 2 — Backend Services Complete, API Routes & Frontend Integration Pending

| Module | Feature | Backend Service | What's Next |
|--------|---------|:-:|-------------|
| **AI Matching** | YOLO object detection + OpenCLIP image embeddings + TF-IDF text similarity | ✅ `embeddingService.ts`, `findImagePairs.ts` | API route exposure, frontend match display UI |
| **Fraud Detection** | Competing claim evaluation, suspicion scoring, repeat-offender detection | ✅ `fraudDetectionService.ts` | Wire into claim submission route, admin fraud dashboard |
| **PDF Generation** | Handover letters and claim confirmation PDFs via PDFKit | ✅ `letterService.ts` | API download endpoint, frontend download button |

> **AI Model Status:** YOLO models have been tested on custom campus data (photos taken inside Amrita) and perform appreciably well. One of the four YOLO models can count objects per class across different categories within the same photo. Fine-tuning notebooks are available in `YOLO_Finetuning/`.

---

## Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express 4 | REST API server |
| TypeScript | Type-safe backend code |
| MongoDB + Mongoose | Database & ODM |
| Redis + Bull | Caching, OTP storage, job queues |
| JWT + Argon2 | Authentication & password hashing |
| Zod | Request validation schemas |
| SendGrid | Transactional email |
| Fast2SMS | SMS OTP (India) |
| Cloudinary | Image storage & CDN |
| PDFKit | PDF document generation |
| node-cron | Background job scheduling |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS | Utility-first styling |
| GSAP + Framer Motion | Animations & effects |
| Axios | HTTP client |
| React Router v6 | Client-side routing |
| Lucide React | Icon library |

### AI/ML
| Technology | Purpose |
|-----------|---------|
| YOLOv8 (4 models) | Object detection (phones, electronics, stationery, computer peripherals) |
| OpenCLIP | Image embedding vectors |
| TF-IDF | Text similarity scoring |
| HuggingFace Inference API | Model hosting |
| Roboflow | Stationery classification workflow |

### Testing
| Technology | Purpose |
|-----------|---------|
| Vitest | Backend & frontend unit/integration tests |
| Supertest | HTTP assertion for backend routes |
| mongodb-memory-server | In-memory MongoDB for test isolation |
| React Testing Library | Frontend component testing |
| Playwright | End-to-end browser testing |

---

## Architecture Overview

```
┌─────────────────┐       REST API        ┌──────────────────┐       Mongoose       ┌───────────┐
│    Frontend      │ ◄──────────────────► │     Backend       │ ◄──────────────────► │  MongoDB  │
│  React + Vite    │                      │  Express + TS     │                      │           │
│  Tailwind + GSAP │                      │  Zod Validation   │                      └───────────┘
└─────────────────┘                      └────────┬──────────┘
                                                   │
                                    ┌──────────────┼──────────────┐
                                    │              │              │
                              ┌─────┴─────┐  ┌────┴────┐  ┌─────┴──────┐
                              │   Redis    │  │  Bull   │  │ Cloudinary │
                              │ OTP/Cache  │  │ Queues  │  │  Images    │
                              └───────────┘  └─────────┘  └────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
              ┌─────┴─────┐  ┌─────┴─────┐  ┌─────┴──────┐
              │ SendGrid   │  │ Fast2SMS  │  │ HuggingFace│
              │  (Email)   │  │  (SMS)    │  │  (AI/ML)   │
              └───────────┘  └───────────┘  └────────────┘
```

---

## Repository Structure

```
lost-and-found-system/
├── backend/                          # Express + TypeScript API
│   ├── src/
│   │   ├── config/                   # Database, Redis, Cloudinary, queue, env config
│   │   ├── middleware/               # Auth, role-based access, validation, error handling
│   │   ├── models/                   # Mongoose schemas (7 model files, 15+ collections)
│   │   ├── routes/v1/                # Versioned API routes (8 route modules)
│   │   ├── schemas/                  # Zod validation schemas
│   │   ├── services/                 # Business logic (10+ service modules)
│   │   ├── utils/                    # JWT, password hashing, helpers
│   │   ├── scripts/                  # Database seeding
│   │   ├── app.ts                    # Express app setup
│   │   └── server.ts                 # Server entry point
│   ├── tests/                        # Backend test files
│   └── .env.example                  # Environment variable template
├── frontend/                         # React + Vite SPA
│   ├── src/
│   │   ├── components/               # Reusable UI components (Sidebar, Navbar, etc.)
│   │   ├── pages/                    # Page components (10+ pages)
│   │   ├── context/                  # React Context (AuthContext, ThemeContext)
│   │   ├── services/                 # Axios API layer
│   │   ├── hooks/                    # Custom hooks (useGSAPAnimations, etc.)
│   │   ├── effects/                  # 39+ GSAP/Framer Motion effects
│   │   ├── tests/                    # Frontend test files
│   │   ├── App.jsx                   # Root component with routing
│   │   └── main.jsx                  # React DOM entry
│   └── .env.example
├── e2e/                              # Playwright end-to-end tests
│   ├── tests/                        # E2E test specs
│   ├── playwright.config.ts
│   └── e2e_testing_documentation.md
├── YOLO_Finetuning/                  # AI/ML model training notebooks
├── Design/                           # UML diagrams & design assets
├── docs/                             # Documentation (Git submodule)
├── DEVDOCS.md                        # Developer documentation
└── README.md                         # This file
```

---

## Quick Start

### Prerequisites

- **Node.js** 18+
- **MongoDB** (local or Atlas)
- **Redis** (optional — graceful fallback to in-memory)
- **Git**

### Installation

```bash
# Clone repository
git clone https://github.com/Lost-and-Found-Tracking-System/lost-and-found-system.git
cd lost-and-found-system

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Install E2E test dependencies (optional)
cd ../e2e && npm install
```

### Environment Setup

**Backend** — create `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/lostfound

# JWT
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Client
CLIENT_URL=http://localhost:5173

# Email (SendGrid) — logs to console if not set
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=no-reply@example.com

# SMS (Fast2SMS) — logs to console if not set
FAST2SMS_API_KEY=your-fast2sms-key

# Image Upload (Cloudinary) — returns 503 if not set
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Redis — falls back to in-memory if not set
REDIS_URL=redis://localhost:6379

# AI (HuggingFace) — AI features disabled if not set
HUGGINGFACE_API_KEY=your-hf-key
```

**Frontend** — create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Running the Application

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

---

## API Endpoints

All routes are versioned under `/api/v1/`:

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | — | Register new user |
| `POST` | `/auth/login` | — | Login with email/password |
| `POST` | `/auth/refresh` | Cookie | Refresh access token |
| `POST` | `/auth/logout` | Bearer | Logout & revoke session |
| `POST` | `/auth/visitor/request-otp` | — | Request visitor OTP |
| `POST` | `/auth/visitor/verify-otp` | — | Complete visitor registration |
| `POST` | `/auth/forgot-password` | — | Initiate password reset |
| `POST` | `/auth/reset-password` | — | Complete password reset |
| `GET` | `/users/profile` | Bearer | Get user profile |
| `PUT` | `/users/profile` | Bearer | Update user profile |
| `GET` | `/users/my-items` | Bearer | Get user's reported items |
| `GET` | `/users/login-activity` | Bearer | Get login history |
| `GET/PUT` | `/users/notification-preferences` | Bearer | Manage notification settings |
| `POST` | `/items` | Bearer | Report a lost/found item |
| `GET` | `/items` | Optional | Search/browse items |
| `GET` | `/items/:id` | Optional | Get item details |
| `POST` | `/items/drafts` | Bearer | Save draft submission |
| `GET` | `/items/drafts/me` | Bearer | Get user's draft |
| `DELETE` | `/items/drafts/me` | Bearer | Delete user's draft |
| `POST` | `/items/organization` | Bearer | Submit on behalf of org |
| `POST` | `/claims` | Bearer | Submit ownership claim |
| `GET` | `/claims/:id` | — | Get claim details |
| `GET` | `/claims/user/my-claims` | Bearer | Get user's claims |
| `POST` | `/claims/:id/withdraw` | Bearer | Withdraw a claim |
| `GET` | `/notifications` | Bearer | Get notifications |
| `PUT` | `/notifications/:id/read` | Bearer | Mark as read |
| `PUT` | `/notifications/read-all` | Bearer | Mark all as read |
| `DELETE` | `/notifications/:id` | Bearer | Delete notification |
| `GET` | `/zones` | — | Get campus zones |
| `GET` | `/zones/:id` | — | Get single zone |
| `POST` | `/zones` | Admin | Create campus zone |
| `PUT` | `/zones/:id` | Admin | Update campus zone |
| `POST` | `/uploads/image` | Bearer | Upload single image |
| `POST` | `/uploads/images` | Bearer | Upload multiple images |
| `DELETE` | `/uploads/:publicId` | Bearer | Delete uploaded image |
| `GET` | `/admin/stats` | Admin | Dashboard statistics |
| `GET` | `/admin/activity` | Admin | Live activity feed |
| `GET` | `/dashboard/stats` | Bearer | User dashboard stats |

---

## Database Schema

### Collections

| Collection | Model File | Description |
|-----------|------------|-------------|
| `users` | `models/identity.ts` | User accounts with roles, credentials, profiles |
| `login_sessions` | `models/identity.ts` | Active JWT sessions with device info |
| `login_activity_logs` | `models/identity.ts` | Login attempt history |
| `items` | `models/items.ts` | Lost/found items with GeoJSON location, AI metadata |
| `draft_submissions` | `models/items.ts` | Auto-saved item drafts |
| `campus_zones` | `models/locations.ts` | Campus areas with Polygon geo-boundaries |
| `claims` | `models/claims.ts` | Ownership claims with proof & status |
| `claim_conflicts` | `models/claims.ts` | Multi-claim conflict detection |
| `claim_decisions` | `models/claims.ts` | Admin claim resolution history |
| `archived_claims` | `models/claims.ts` | Long-term claim archive |
| `ai_matches` | `models/ai.ts` | AI-generated item match pairs |
| `ai_configurations` | `models/ai.ts` | Configurable AI thresholds & weights |
| `ai_decision_versions` | `models/ai.ts` | AI decision rollback history |
| `notifications` | `models/notifications.ts` | User notifications |
| `notification_preferences` | `models/notifications.ts` | Per-user notification settings |
| `announcements` | `models/notifications.ts` | System-wide announcements |
| `audit_logs` | `models/audit.ts` | System action audit trail |
| `data_retention_policies` | `models/audit.ts` | Configurable data lifecycle rules |

---

## AI/ML Pipeline

The system implements a **three-tier semantic processing pipeline**. Backend services are fully built; API route exposure and frontend integration are planned for Sprint 2.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Tier 1:    │     │   Tier 2:    │     │   Tier 3:    │
│ YOLO Object  │────►│  OpenCLIP    │────►│   TF-IDF     │
│  Detection   │     │  Image       │     │   Text       │
│ (4 models)   │     │  Embeddings  │     │  Embeddings  │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌──────────────────────────────────────────────────────┐
│              Weighted Similarity Score                │
│   Score = w₁·text + w₂·image + w₃·location + w₄·time │
│   (Configurable weights via admin panel)             │
└──────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────┐
│   Fraud Detection    │
│ Competing claim eval │
│ Suspicion scoring    │
└──────────────────────┘
```

**YOLO Models:**
- `IndUSV/yoloV8_SE_3` — Mobile phones, suitcases, handbags
- `IndUSV/Yolov8_Screen_Detection` — Electronic gadgets & screens
- `IndUSV/computerApparatus-detector` — Keyboards, mice, monitors
- Roboflow Stationery Classifier — Pens, pencils, notebooks

Fine-tuning notebooks are available in `YOLO_Finetuning/`.

---

## Testing

| Layer | Tool | Location | Command |
|-------|------|----------|---------|
| Backend Unit Tests | Vitest + mongodb-memory-server | `backend/tests/` | `cd backend && npm test` |
| Backend Integration Tests | Vitest + Supertest | `backend/tests/` | `cd backend && npm test` |
| Frontend Unit Tests | Vitest + React Testing Library | `frontend/src/tests/` | `cd frontend && npm test` |
| End-to-End Tests | Playwright (Chromium) | `e2e/tests/` | `cd e2e && npx playwright test` |
| Coverage Report | V8 | — | `cd backend && npm run test:coverage` |

---

## UML Diagrams

All UML diagrams are maintained in the `Design/` directory:
- Use Case Diagrams
- Class Diagrams
- Sequence Diagrams
- ER Diagrams
- Activity Diagrams
- Component Diagrams

---

## Multi-Repo Structure

This project uses a **multi-repository architecture** under the [Lost-and-Found-Tracking-System](https://github.com/Lost-and-Found-Tracking-System) GitHub organization:

| Repository | Purpose |
|-----------|---------|
| [`lost-and-found-system`](https://github.com/Lost-and-Found-Tracking-System/lost-and-found-system) | Main application (backend + frontend + e2e + AI/ML) |
| [`docs`](https://github.com/Lost-and-Found-Tracking-System/docs) | Documentation submodule (DevDocs, test reports) |

---

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)

---
