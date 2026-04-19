# ⛳ Golf Heroes — MERN Stack

> Play Golf. Win Prizes. Change Lives.

Full-stack web app: subscription-based golf scoring platform with monthly prize draws and charity integration.

---

## 🛠 Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, React Router v6, Tailwind CSS, Framer Motion |
| Backend   | Node.js, Express.js               |
| Database  | MongoDB + Mongoose                |
| Auth      | JWT (jsonwebtoken + bcryptjs)     |
| Payments  | Stripe (Checkout + Webhooks)      |
| File Upload | Multer                          |

---

## 📁 Project Structure

```
golf-heroes/
├── backend/          ← Express API
│   ├── controllers/  ← Business logic
│   ├── models/       ← Mongoose schemas
│   ├── routes/       ← API routes
│   ├── middleware/   ← Auth middleware
│   ├── utils/        ← Seed script
│   └── server.js     ← Entry point
└── frontend/         ← React App
    └── src/
        ├── pages/    ← All pages (auth, dashboard, admin)
        ├── components/
        ├── context/  ← AuthContext
        └── utils/    ← Axios instance
```

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env   # Fill in your values

# Frontend
cd ../frontend
npm install
cp .env.example .env   # Fill in your values
```

### 2. Configure `.env` (backend)

```
MONGO_URI=mongodb://localhost:27017/golf_heroes
JWT_SECRET=your_secret_min_32_chars
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...
CLIENT_URL=http://localhost:3000
```

### 3. Configure `.env` (frontend)

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 4. Seed Database

```bash
cd backend
npm run seed
```

This creates:
- **Admin**: `admin@golfheroes.com` / `Admin@1234`
- **User**: `user@golfheroes.com` / `User@1234`
- 4 sample charities

### 5. Run Dev Servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm start
```

Open http://localhost:3000

---

## 💳 Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Create two recurring prices (Monthly £9.99/mo, Yearly £89.99/yr)
3. Copy their Price IDs to `.env`
4. For webhooks locally, use [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:5000/api/webhook
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint              | Access  |
|--------|-----------------------|---------|
| POST   | /api/auth/register    | Public  |
| POST   | /api/auth/login       | Public  |
| GET    | /api/auth/me          | Private |
| PUT    | /api/auth/me          | Private |
| PUT    | /api/auth/change-password | Private |

### Scores
| Method | Endpoint         | Access              |
|--------|------------------|---------------------|
| GET    | /api/scores      | Private             |
| POST   | /api/scores      | Private + Subscribed|
| PUT    | /api/scores/:id  | Private             |
| DELETE | /api/scores/:id  | Private             |

### Draws
| Method | Endpoint                  | Access  |
|--------|---------------------------|---------|
| GET    | /api/draws                | Public  |
| GET    | /api/draws/:id/my-entry   | Private |

### Charities
| Method | Endpoint                     | Access  |
|--------|------------------------------|---------|
| GET    | /api/charities               | Public  |
| GET    | /api/charities/my-selection  | Private |
| POST   | /api/charities/select        | Private |

### Subscriptions
| Method | Endpoint                           | Access  |
|--------|------------------------------------|---------|
| POST   | /api/subscriptions/create-checkout | Private |
| POST   | /api/subscriptions/cancel          | Private |
| GET    | /api/subscriptions/my-subscription | Private |
| POST   | /api/subscriptions/portal          | Private |

### Winners
| Method | Endpoint                         | Access  |
|--------|----------------------------------|---------|
| GET    | /api/winners/my-winnings         | Private |
| POST   | /api/winners/:id/submit-proof    | Private |

### Admin (role: admin only)
| Method | Endpoint                        |
|--------|---------------------------------|
| GET    | /api/admin/analytics            |
| GET    | /api/admin/users                |
| DELETE | /api/admin/users/:id            |
| GET    | /api/admin/draws                |
| POST   | /api/admin/draws                |
| POST   | /api/admin/draws/:id/simulate   |
| POST   | /api/admin/draws/:id/publish    |
| POST   | /api/admin/charities            |
| PUT    | /api/admin/charities/:id        |
| DELETE | /api/admin/charities/:id        |
| GET    | /api/admin/winners              |
| PUT    | /api/admin/winners/:id/verify   |
| PUT    | /api/admin/winners/:id/pay      |

---

## 🚀 Deployment

### Backend (Railway / Render)
- Set all env vars in dashboard
- MongoDB → use [MongoDB Atlas](https://cloud.mongodb.com) free tier
- Start command: `node server.js`

### Frontend (Vercel / Netlify)
- Set `REACT_APP_API_URL` to your deployed backend URL
- Build command: `npm run build`
- Output: `build/`

---

## ✅ PRD Checklist

- [x] User signup & login (JWT)
- [x] Subscription flow (Stripe Checkout, monthly + yearly)
- [x] Score entry — rolling 5-score logic, 1 per date
- [x] Draw system — random & algorithmic, simulation + publish
- [x] Charity selection with adjustable % contribution
- [x] Winner verification flow (proof upload)
- [x] Payout tracking (pending → paid)
- [x] User Dashboard — all modules functional
- [x] Admin Panel — full control
- [x] Responsive design (mobile + desktop)
- [x] Error handling throughout
- [x] Jackpot rollover logic
- [x] Prize pool auto-calculation (40/35/25 split)
