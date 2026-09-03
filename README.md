# 1Fi Store — Smartphones on Mutual-Fund-Backed EMI

> **1Fi SDE1 Assignment** — a full-stack web app that displays smartphones with multiple EMI plans backed by mutual funds. All product, pricing, image and EMI-plan data is served dynamically from a database via a REST API — **zero hardcoded data in the UI**.

![Stack](https://img.shields.io/badge/React-18-61dafb) ![Stack](https://img.shields.io/badge/Express-4-black) ![Stack](https://img.shields.io/badge/SQLite-3-blue) ![Stack](https://img.shields.io/badge/Tailwind-3-38bdf8)

---

## ✨ Features

| Requirement | Status |
|---|---|
| Product details (name, variant, MRP, price, image) | ✅ |
| Selectable EMI plans (monthly ₹, tenure, interest %, cashback) | ✅ |
| "Proceed with selected plan" button | ✅ |
| Data from DB via API (no hardcoding) | ✅ |
| Unique URL per product (`/products/:slug`) | ✅ |
| ≥ 3 products, each with ≥ 2 variants | ✅ 3 products / 6 variants / 21 plans |
| REST APIs (`/api/products`, `/api/products/:slug`) | ✅ |
| Database schema + seed data | ✅ `backend/db/schema.sql` |
| Responsive UI (React + Tailwind) | ✅ Premium dark-theme glassmorphism design |

---

## 🧱 Tech Stack

- **Frontend:** React 18, React Router 6, Tailwind CSS 3, Vite 5
- **Backend:** Node.js, Express 4
- **Database:** SQLite (`better-sqlite3`) — zero-config for review/demo; the schema is standard SQL and a PostgreSQL port is documented at the bottom of `schema.sql`.

---

## 🚀 Setup & Run

### Prerequisites
- Node.js ≥ 18

### 1. Backend (API + DB)

```bash
cd backend
npm install
npm run seed      # creates + seeds db/onefi.db (3 products, 6 variants, 21 EMI plans)
npm start         # serves API at http://localhost:5000
```

### 2. Frontend (dev mode, hot reload)

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173 (proxies /api & /images to :5000)
```

### 3. Production mode (single server)

```bash
cd frontend && npm run build    # outputs frontend/dist
cd ../backend && npm start      # http://localhost:5000 serves API + built React app
```

Open **http://localhost:5000** → click any phone → you'll land on a unique URL like `/products/iphone-17-pro`.

---

## 🔌 API Endpoints

### `GET /api/health`
```json
{ "status": "ok" }
```

### `GET /api/products` — list all products (default-variant summary)
```json
{
  "products": [
    {
      "slug": "iphone-17-pro",
      "name": "iPhone 17 Pro",
      "brand": "Apple",
      "variant": "Silver · 256 GB",
      "mrp": 134900,
      "price": 129900,
      "imageUrl": "/images/iphone-17-pro-silver.jpg",
      "emiStartsAt": 21650
    }
  ]
}
```

### `GET /api/products/:slug` — product detail with variants + EMI plans
`GET /api/products/iphone-17-pro` →
```json
{
  "slug": "iphone-17-pro",
  "name": "iPhone 17 Pro",
  "brand": "Apple",
  "description": "Apple iPhone 17 Pro with A19 Pro chip …",
  "variants": [
    {
      "id": 1,
      "name": "Silver · 256 GB",
      "color": "Silver",
      "storage": "256 GB",
      "finish": "Titanium",
      "mrp": 134900,
      "price": 129900,
      "imageUrl": "/images/iphone-17-pro-silver.jpg",
      "isDefault": true,
      "emiPlans": [
        {
          "id": 1,
          "tenureMonths": 6,
          "interestRate": 0,
          "cashback": 2000,
          "provider": "1Fi Zero-Cost MF Plan",
          "monthlyPayment": 21650,
          "totalPayable": 127900
        }
      ]
    }
  ]
}
```

Unknown slug → `404 { "error": "Product not found", "slug": "…" }`

> **EMI math:** monthly payments use the standard reducing-balance formula
> `P·r(1+r)ⁿ / ((1+r)ⁿ − 1)` with `r = annualRate/12/100`; 0% plans divide evenly.
> `totalPayable = monthly × tenure − cashback`.

---

## 🗄️ Database Schema

```
products ──────────────┐
  id (PK)              │ 1
  slug  (UNIQUE)       │
  name                 │        product_variants ────────────┐
  brand                │ n         id (PK)                   │ 1
  description          └─────────► product_id (FK)           │
                                   name / color / storage    │        emi_plans
                                   finish                    │ n        id (PK)
                                   mrp / price               └───────►  variant_id (FK)
                                   image_url                            tenure_months
                                   is_default                           interest_rate
                                                                          cashback
                                                                          provider
```

Full DDL with constraints & indexes: [`backend/db/schema.sql`](backend/db/schema.sql)
Seed data: [`backend/db/seed.js`](backend/db/seed.js)

---

## 📁 Project Structure

```
onefi-emi-store/
├── backend/
│   ├── server.js               # Express app + API routes + EMI calculator
│   ├── db/
│   │   ├── schema.sql          # DDL (SQLite; PG port notes included)
│   │   ├── seed.js             # seed script (npm run seed)
│   │   └── onefi.db            # generated database
│   └── public/images/          # product images served at /images/*
├── frontend/
│   ├── src/
│   │   ├── pages/HomePage.jsx      # product listing grid
│   │   ├── pages/ProductPage.jsx   # details + variant picker + EMI plans + CTA
│   │   ├── components/Navbar.jsx   # glassmorphism navigation
│   │   ├── api.js                  # fetch wrappers + INR formatter
│   │   ├── index.css               # design system (dark theme + glassmorphism)
│   │   └── App.jsx / main.jsx
│   ├── tailwind.config.js      # custom brand colors + tokens
│   └── vite.config.js          # dev proxy to :5000
└── README.md
```

---

## ☁️ Deployment

The production build is a **single Node process** (Express serves both the API and the built React app), so it deploys cleanly to Render / Railway / Fly.io:

- **Build command:** `cd frontend && npm install && npm run build && cd ../backend && npm install`
- **Start command:** `cd backend && npm start`
- The DB auto-seeds on first boot if `onefi.db` is missing.

For Vercel-style split deploys, deploy `frontend/` as a static SPA with `VITE_API_BASE` pointing at the hosted API.

---

## 🎥 Demo Video

_Link to be added — 2–5 min walkthrough of UI, API responses, and the seeded database._
