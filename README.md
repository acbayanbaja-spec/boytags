# Boytag's Lechon Manok & Chicken House — Ordering and Delivery Platform

> A production-grade commercial ordering, delivery, and Kitchen Display System (KDS) engineered for **Boytag's Lechon Manok & Chicken House** (South Cotabato - Sarangani Road, Poblacion, Tupi, South Cotabato). Built with modern full-stack TypeScript/JavaScript, React 19, Express 5, PostgreSQL via Supabase, Prisma ORM, and resilient dual-mode client dispatch.

---

## 1. Project Overview

Boytag's ordering platform automates and streamlines fast-paced poultry restaurant operations in **Poblacion, Tupi, South Cotabato**. It replaces manual telephone and pen-and-paper order logs with a synchronized, real-time dispatch, kitchen queue system, and customer ordering portal.

Key operational problems solved:
- **Poblacion, Tupi Precision Pinpointing**: Interactive Leaflet GPS map centered directly on Tupi, South Cotabato (`6.3333, 124.9515`) with landmark references and doorstep rider instructions.
- **Culinary Customizer Engine**: Tailor orders with cut preferences (Whole, 4 pcs, 8 pcs), authentic Filipino sawsawan dipping sauces (House Garlic Liver Gravy, Toyomansi & Labuyo, Spiced Sinamak), and add-on garlic rice.
- **Dual-View Kitchen Display System (KDS)**: Kanban rail & grid ticket management with real-time stage timers and printable 80mm thermal kitchen slips.
- **Printable Thermal Customer Receipts**: Commercial standard itemized receipts with barcodes and non-VAT register formats.
- **Zero-Dependency Web Audio FX**: Low-latency synthesized sound engine with sound effects for additions, advances, and urgent alerts.
- **Dual-Mode Resilient Architecture**: Connects to live Express API / PostgreSQL, gracefully falling back to a full local simulation store when deployed on static previews so every single button works.
- **Race-Condition-Safe Inventory**: Atomic database transactions decrement product stock on checkout and automatically tag zero-stock items as **SOLD OUT** to prevent overselling.
- **Automated Unclaimed Order Detection**: An active background cron daemon marks orders exceeding pickup/delivery thresholds as `UNCLAIMED` and sounds high-priority staff alerts.

---

## 2. Technology Stack

### Frontend (`/client`)
- **Core**: React 19, TypeScript 5.9, Vite 7
- **Styling**: Tailwind CSS v4, custom brand design tokens (`Outfit` sans + `Fraunces` editorial serif)
- **Animations**: Framer Motion 12 (with full `prefers-reduced-motion` compliance)
- **State Management**: TanStack React Query v5, Context API (Auth, Cart)
- **Forms & Validation**: React Hook Form 7, Zod 4
- **Maps**: Leaflet 1.9 & React Leaflet 5
- **Charts**: Recharts 3
- **Icons & Notifications**: Lucide React, Sonner rich toasts
- **Real-Time Updates**: Server-Sent Events (SSE) subscriber

### Backend (`/server`)
- **Runtime**: Node.js 20+, Express.js 5
- **Database & ORM**: PostgreSQL (hosted on Supabase), Prisma ORM 6
- **Security**: JWT (Access + Refresh tokens with rotation), bcryptjs password hashing (12 rounds), Helmet headers, CORS policies, Express Rate Limiter
- **Background Jobs**: Automated interval scheduler for unclaimed order alerts
- **Real-Time Hub**: SSE event bus (`realtime/hub.js`) broadcasting order and inventory events

---

## 3. Architecture & Monorepo Structure

```
boytags/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI, MapPin, OrderTimeline, Layouts
│   │   ├── context/            # AuthContext, CartContext
│   │   ├── hooks/              # useRealtime (SSE bridge)
│   │   ├── lib/                # API client with token handling, utils
│   │   ├── pages/              # Customer pages
│   │   │   ├── HomePage.tsx
│   │   │   ├── MenuPage.tsx
│   │   │   ├── CartPage.tsx
│   │   │   ├── CheckoutPage.tsx
│   │   │   ├── OrdersPage.tsx
│   │   │   ├── OrderTrackingPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── NotificationsPage.tsx
│   │   │   ├── AuthPage.tsx
│   │   │   └── ResetPasswordPage.tsx
│   │   └── pages/staff/        # Operations & Kitchen pages
│   │       ├── DashboardPage.tsx
│   │       ├── QueuePage.tsx
│   │       ├── ProductsPage.tsx
│   │       └── AlertsPage.tsx
│   ├── vercel.json             # Vercel SPA routing configuration
│   └── vite.config.ts          # Rollup manual chunking & proxy
│
├── server/                     # Node.js Express REST API
│   ├── prisma/
│   │   ├── schema.prisma       # PostgreSQL schema
│   │   └── seed.js             # Initial categories, dishes & demo accounts
│   ├── src/
│   │   ├── config/             # Environment & Prisma client instances
│   │   ├── controllers/        # Auth, Ops, Orders, Products controllers
│   │   ├── middleware/         # Auth verification, Zod validation, error handler
│   │   ├── realtime/           # Server-Sent Events hub
│   │   ├── routes/             # RESTful API routes
│   │   ├── services/           # Business logic, inventory transactions, alerts
│   │   └── utils/              # Status machine, order numbers, tokens, logger
│   └── .env.example
│
├── render.yaml                 # Render backend deployment manifest
└── package.json                # Monorepo scripts (dev, build, db)
```

---

## 4. Database Architecture & Schema

The PostgreSQL schema is managed via Prisma ORM:

```mermaid
erDiagram
    User ||--o{ Order : places
    User ||--o{ Notification : receives
    User ||--o{ Alert : acknowledges
    User ||--o{ OrderHistory : initiates
    Category ||--o{ Product : categorizes
    Order ||--|{ OrderItem : contains
    Product ||--o{ OrderItem : references
    Order ||--o| DeliveryDetail : pinpoints
    Order ||--o{ OrderHistory : logs
    Order ||--o{ Alert : triggers
```

### Models Summary:
- **`User`**: Roles (`CUSTOMER`, `STAFF`, `ADMIN`), bcrypt password hashes, reset tokens.
- **`Product` & `Category`**: Names, descriptions, prices, image URLs, `availableQty`, `soldOut` boolean flag.
- **`Order`**: Order number (`BT-1001`), order type (`PICKUP` | `DELIVERY`), state machine status (`PENDING` -> `CONFIRMED` -> `PREPARING` -> `READY` -> `OUT_FOR_DELIVERY` -> `COMPLETED` | `CANCELLED` | `UNCLAIMED`), priority (`NORMAL`, `HIGH`, `URGENT`), scheduled time, pricing.
- **`OrderItem`**: Snapshot product name, unit price, quantity, line total.
- **`DeliveryDetail`**: Complete address, landmark description, rider notes, contact number, exact GPS latitude/longitude.
- **`OrderHistory`**: Comprehensive audit log (`actorName`, `actorRole`, `action`, `previousValue`, `newValue`, `createdAt`).
- **`Alert`**: Real-time alerts (`UNCLAIMED_ORDER`, `SOLD_OUT`, `LOW_STOCK`, `NEW_ORDER`) with acknowledgement and resolution tracking.
- **`Setting`**: Store coordinates, delivery fee, low stock threshold, unclaimed cutoff minutes.

---

## 5. Quick Start & Local Development

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL (Supabase or local instance)

### 1. Clone & Install Dependencies
```bash
# Install root, client, and server dependencies
npm install
npm install --prefix client
npm install --prefix server
```

### 2. Environment Configuration

Create `server/.env`:
```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres?sslmode=require
JWT_ACCESS_SECRET=your_super_long_random_access_secret_key_32_chars
JWT_REFRESH_SECRET=your_super_long_random_refresh_secret_key_32_chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
UNCLAIMED_CHECK_MS=30000
LOG_LEVEL=info
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:4000
```

### 3. Database Migration & Seed Data
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial categories, menu items, and demo users
npm run db:seed
```

### 4. Seed User Accounts

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@boytags.local` | `Admin123!` | Full Operations & Settings |
| **Staff** | `staff@boytags.local` | `Staff123!` | Kitchen Queue & Menu Stock |
| **Customer** | `customer@boytags.local` | `Customer123!` | Order Placement & Tracking |

### 5. Run Local Development Server
```bash
# Runs both the Express API and Vite React frontend concurrently
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000`
- Health check: `http://localhost:4000/health`

---

## 6. Core Features in Detail

### A. Quick Order Queue
- Accessible at `/staff/queue`.
- Automatically sorted by priority: `UNCLAIMED` > `URGENT` (<0 mins) > `HIGH` (<30 mins) > `NORMAL`.
- Shows order number, customer name, phone, items summary, elapsed waiting counter, and valid next-step transition buttons.
- Real-time SSE updates without requiring page reload.

### B. Address Pinpointing & Delivery Notes
- Interactive Leaflet map with draggable pin (`client/src/components/MapPin.tsx`).
- Captures exact coordinates (lat/lng) with human-readable street address, landmark ("Near the barangay hall, blue gate beside sari-sari store"), rider notes, and contact phone.
- Read-only map preview on the customer's order tracking screen.

### C. Unclaimed Order Alert Daemon
- Backend interval (`alertService.js`) scans for orders in `READY` or `OUT_FOR_DELIVERY` status exceeding the `unclaimedThresholdMinutes` (default: 20 mins).
- Transitions order status to `UNCLAIMED`, elevates priority to `URGENT`, creates a persistent `Alert` record, and broadcasts SSE events to staff.
- High-visibility banner rendered on the customer order tracking view and staff dashboard.

### D. Concurrency-Safe Automatic Sold-Out Status
- Checkout transactions atomically verify stock and execute `decrement` updates:
  ```js
  const result = await tx.product.updateMany({
    where: { id: item.productId, active: true, availableQty: { gte: item.quantity } },
    data: { availableQty: { decrement: item.quantity } },
  });
  ```
- If stock hits 0, `soldOut` is flagged `true`, triggering a `SOLD_OUT` alert.
- Out-of-stock items are disabled in the customer menu and cannot be added to cart.

### E. Order Change History (Audit Trail)
- Every creation, item modification, schedule change, delivery note update, cancellation, or staff status advance logs a record to `OrderHistory`:
  - `actorName`, `actorRole`, `action`, `previousValue`, `newValue`, `createdAt`.
- Rendered on the tracking view and staff queue inspection dialog as an animated timeline.

### F. Culinary Dish Customizer Modal
- Customizer modal (`client/src/components/DishCustomizerModal.tsx`) allows customers to specify:
  - Cutting preference: Whole roast chicken, quartered (4 pcs), or 8-piece party cut.
  - Authentic sawsawan selection: House Garlic Liver Gravy, Toyomansi & Labuyo, Spiced Sinamak Vinegar, Sweet Chili Glaze.
  - Add-on fragrant garlic rice and extra sauce cups.
  - Special kitchen requests (e.g., extra crispy skin, sauces packed separately).

### G. Kitchen Display System (KDS) & 80mm Thermal Slips
- Staff KDS (`client/src/pages/staff/QueuePage.tsx`) provides:
  - Dual-mode view: Kitchen Kanban Rail grouped by stage (`PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `OUT_FOR_DELIVERY`) or Dense Ticket Grid.
  - Live elapsed preparation timer per ticket with urgent visual pulsing when prep exceeds target time.
  - Direct 80mm thermal kitchen prep slip modal (`client/src/components/KitchenTicketModal.tsx`) formatted with station checkboxes, order notes, and print styling.

### H. Printable Customer Thermal Receipts
- Official non-VAT customer receipt modal (`client/src/components/ReceiptModal.tsx`):
  - Formatted with store header: Poblacion, Tupi, South Cotabato (`(083) 228-1234`).
  - Barcode representation, itemized breakdown, discounts, delivery fees, customer information, and cashier signature.
  - Dedicated print stylesheet (`@media print`) for clean pos receipt generation.

### I. Customer 5-Star Reviews & Rating Modal
- After order completion, customers can submit 5-star ratings (`client/src/components/RatingModal.tsx`):
  - Interactive star selection with glowing ember accents.
  - Compliment chips: *Juiciest Chicken*, *Crispy Skin*, *Fast Delivery*, *Generous Gravy*, *Friendly Rider*.
  - Feedback comments submitted to the platform.

### J. Zero-Dependency Web Audio Synthesizer Engine
- High-fidelity Web Audio API engine (`client/src/lib/sound.ts`):
  - Custom synthesized waveforms for UI clicks, adding items to cart, advancing ticket stages, success confirmations, and emergency kitchen chimes.
  - Persistent sound toggle in the navigation bar respecting user preferences.

### K. Resilient Dual-Mode API & Fallback Store
- Smart client dispatcher (`client/src/lib/api.ts` & `client/src/lib/mockStore.ts`):
  - Direct connection to Express REST API & PostgreSQL database.
  - Instant automatic fallback to comprehensive `localStorage` simulation if offline or on static CDN deployments, guaranteeing 100% of buttons, logins, orders, and dashboard features work without throwing unhandled network errors.

---

## 7. REST API Endpoints

### Authentication
- `POST /api/auth/register` — Register new customer account
- `POST /api/auth/login` — Sign in with email and password
- `POST /api/auth/refresh` — Rotate refresh token for access token
- `POST /api/auth/forgot-password` — Request password reset token
- `POST /api/auth/reset-password` — Reset account password with token
- `GET /api/auth/me` — Retrieve current authenticated user profile
- `PATCH /api/auth/me` — Update name and phone number

### Products & Categories
- `GET /api/categories` — List active categories
- `GET /api/products` — List products (filtered by category/availability)
- `GET /api/products/:id` — Get product details
- `POST /api/products` — (Staff/Admin) Create new dish
- `PATCH /api/products/:id` — (Staff/Admin) Update dish details / stock
- `DELETE /api/products/:id` — (Staff/Admin) Deactivate dish

### Orders & Operations
- `POST /api/orders` — Place order with items, schedule, delivery details
- `GET /api/orders` — List user's orders or staff catalog
- `GET /api/orders/queue` — (Staff/Admin) Get active kitchen queue
- `GET /api/orders/:id` — Get order details by ID
- `PATCH /api/orders/:id` — Edit schedule or notes (when pending/confirmed)
- `PATCH /api/orders/:id/status` — (Staff/Admin) Advance order status
- `POST /api/orders/:id/cancel` — Cancel order with reason (restores stock)
- `GET /api/orders/:id/history` — Get full change history audit trail
- `GET /api/dashboard/stats` — (Staff/Admin) 8 KPI metrics, 7-day trend series, upcoming orders
- `GET /api/alerts` — (Staff/Admin) List system alerts
- `POST /api/alerts/:id/ack` — (Staff/Admin) Acknowledge alert
- `POST /api/alerts/:id/resolve` — (Staff/Admin) Resolve alert
- `GET /api/events` — Server-Sent Events stream for live push notifications

---

## 8. Production Deployment

### Frontend (Vercel)
1. Link repository to Vercel.
2. Root directory: `client`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment Variables:
   - `VITE_API_URL`: `https://your-render-backend.onrender.com`

### Backend (Render)
1. Create a Web Service linked to the repository.
2. Root directory: `server`
3. Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
4. Start command: `npm start`
5. Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `4000`
   - `DATABASE_URL`: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres?sslmode=require`
   - `JWT_ACCESS_SECRET`: `<generated 32+ char secret>`
   - `JWT_REFRESH_SECRET`: `<generated 32+ char secret>`
   - `FRONTEND_URL`: `https://your-boytags-app.vercel.app`
   - `CORS_ORIGINS`: `https://your-boytags-app.vercel.app`

### Database (Supabase)
1. Create a new PostgreSQL project on [supabase.com](https://supabase.com).
2. Under **Project Settings -> Database**, copy the **Connection string (URI)**.
3. Replace `[YOUR-PASSWORD]` with your database password.
4. Set the connection string in your Render backend `DATABASE_URL` environment variable.
5. Run `npx prisma db push` or `npx prisma migrate deploy` followed by `node prisma/seed.js`.

---

## 9. License

Proprietary commercial software built for **Boytag's Lechon Manok and Chicken House**. All rights reserved.
