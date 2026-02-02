# Lost & Found System - Amrita Campus

A full-stack application for managing lost and found items on campus.

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally or MongoDB Atlas
- npm or yarn

### 1. Clone & Install

```bash
git clone <repo-url>
cd lost-and-found-system

# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

### 2. Environment Setup

**Backend** - Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lostfound
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here

Also see .env.example
```

**Frontend** - Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the App

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Seed Admin User

```bash
cd backend
npx tsx src/scripts/seed-users.ts
```

**Admin Login:**
- Email: `admin@example.com`
- Password: `Admin@123`

---

## Testing All Features

### User Flows

| Feature | URL | How to Test |
|---------|-----|-------------|
| Landing Page | `localhost:5173/` | Just open it |
| Student Register | `localhost:5173/register` | Fill form, submit |
| Login | `localhost:5173/login` | Use registered credentials |
| Visitor OTP | `localhost:5173/register-visitor` | Enter phone, check backend terminal for OTP |
| Dashboard | `localhost:5173/dashboard` | Login first, see stats |
| Report Item | `localhost:5173/report` | Select lost/found, fill details, pick zone |
| Browse Items | `localhost:5173/inventory` | See all reported items |
| Item Details | `localhost:5173/item/:id` | Click any item |
| Submit Claim | `localhost:5173/claim/:itemId` | Click "Claim" on found item |
| My Claims | `localhost:5173/my-claims` | See your submitted claims |
| Notifications | `localhost:5173/notifications` | Check alerts |
| Profile | `localhost:5173/profile` | Update your info |

### Admin Flows

| Feature | URL | How to Test |
|---------|-----|-------------|
| Admin Dashboard | `localhost:5173/admin` | Login as admin |
| Zone Management | `localhost:5173/admin/zones` | Create campus zones first! |
| User Management | `localhost:5173/admin/roles` | Change user roles |
| Claims Review | `localhost:5173/admin/claims` | Approve/reject claims |
| AI Config | `localhost:5173/admin/ai-config` | Adjust matching settings |

### Test Checklist

**First Time Setup:**
1. [ ] Login as admin
2. [ ] Go to Zone Management → Create at least 5 zones
3. [ ] Logout

**Student Flow:**
1. [ ] Register new student account
2. [ ] Login
3. [ ] Report a LOST item (select zone on map)
4. [ ] Check "My Items" on dashboard shows it
5. [ ] Browse Items → see your lost item listed

**Faculty Flow:**
1. [ ] Register → Admin upgrades to Faculty
2. [ ] Login as Faculty
3. [ ] Report a FOUND item (same category as lost item above)
4. [ ] Browse Items → both items visible

**Claim Flow:**
1. [ ] Login as student
2. [ ] Go to Browse Items → Find the FOUND item
3. [ ] Click item → Submit Claim with ownership proof
4. [ ] Go to My Claims → See pending claim
5. [ ] Login as Admin → Claims → Approve the claim
6. [ ] Check item status changes to "resolved"

**Visitor Flow:**
1. [ ] Go to `/register-visitor`
2. [ ] Enter phone number
3. [ ] Check backend terminal for OTP code
4. [ ] Enter OTP → Auto-login to dashboard
5. [ ] Can report items, browse, claim

---

## Project Structure

```
lost-and-found-system/
├── backend/
│   ├── src/
│   │   ├── routes/v1/      # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── models/         # MongoDB schemas
│   │   ├── middleware/     # Auth, validation
│   │   └── utils/          # Helpers
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/          # React pages
│   │   ├── components/     # Reusable components
│   │   ├── context/        # Auth context
│   │   └── services/       # API calls
│   └── package.json
└── README.md
```

---

## API Endpoints

### Auth
- `POST /api/v1/auth/register` - Student registration
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/visitor/request-otp` - Request OTP
- `POST /api/v1/auth/visitor/verify` - Verify OTP & login

### Items
- `GET /api/v1/items` - Browse all items
- `GET /api/v1/items/user/my-items` - Get user's items
- `POST /api/v1/items` - Report item
- `GET /api/v1/items/:id` - Item details

### Claims
- `POST /api/v1/claims` - Submit claim
- `GET /api/v1/claims/user/my-claims` - User's claims

### Zones
- `GET /api/v1/zones` - List zones
- `POST /api/v1/zones` - Create zone (admin)
- `PUT /api/v1/zones/:id` - Update zone (admin)
- `DELETE /api/v1/zones/:id` - Delete zone (admin)

### Admin
- `GET /api/v1/admin/dashboard` - Stats
- `GET /api/v1/admin/claims` - All claims
- `PUT /api/v1/admin/claims/:id/decision` - Approve/reject

---

## Troubleshooting

**"Please select a location" but no zones showing?**
→ Admin needs to create zones first at `/admin/zones`

**OTP not working?**
→ Check backend terminal - OTP is logged there

**"Reported By: Anonymous" even though not anonymous?**
→ Make sure you pulled latest backend changes

**My Items showing empty?**
→ You need to report an item first, it shows YOUR items only

---

## Tech Stack

- **Frontend:** React, Vite, TailwindCSS, Lucide Icons
- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB with Mongoose
- **Auth:** JWT with refresh tokens

---
