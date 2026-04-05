# EventBooking — Production-Grade SaaS Architecture

**Role:** Senior Staff Software Engineer & System Architect  
**Target:** 100,000+ concurrent users  
**Product class:** Eventbrite / BookMyShow / Ticketmaster (simplified)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Assessment](#2-current-state-assessment)
3. [Target Architecture Overview](#3-target-architecture-overview)
4. [Improved Database Schema](#4-improved-database-schema)
5. [Backend Architecture](#5-backend-architecture)
6. [Frontend Architecture](#6-frontend-architecture)
7. [API Design](#7-api-design)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [Payment System](#9-payment-system)
10. [Ticket & QR Code System](#10-ticket--qr-code-system)
11. [Notification System](#11-notification-system)
12. [Real-Time System](#12-real-time-system)
13. [Search System](#13-search-system)
14. [Caching Strategy](#14-caching-strategy)
15. [Security Model](#15-security-model)
16. [Scalability & Performance](#16-scalability--performance)
17. [UI/UX Design System](#17-uiux-design-system)
18. [DevOps & Deployment](#18-devops--deployment)
19. [Monitoring & Observability](#19-monitoring--observability)
20. [Testing Strategy](#20-testing-strategy)
21. [Code Quality Standards](#21-code-quality-standards)
22. [Sample Code — Key Modules](#22-sample-code--key-modules)
23. [Migration Plan from Current System](#23-migration-plan-from-current-system)

---

## 1. Executive Summary

### Problem

The current system is a functional college project but fails on every production requirement:

- Single process, no horizontal scaling
- No caching — every request hits MySQL directly
- No payment system
- No email notifications
- Polling instead of real-time updates (WebSockets)
- No rate limiting — vulnerable to abuse and DDoS
- No error monitoring, no structured logging
- Frontend has no state management beyond Context API
- No CI/CD pipeline

### Solution

Re-architect into a **modular, horizontally scalable, cloud-native SaaS platform** using:

- **Microservice-ready monolith** (modular monolith first, split later)
- **Redis** for caching and session management
- **Bull queues** for async jobs (emails, payments, analytics)
- **WebSockets** for real-time seat updates
- **Stripe/Razorpay** for payments with webhook confirmation
- **React Query + Zustand** for frontend state
- **Docker + CI/CD** for deployment
- **Sentry + Prometheus** for observability

### Scale Targets

| Metric                  | Target           |
| ----------------------- | ---------------- |
| Concurrent users        | 100,000          |
| API requests/sec        | 10,000 RPS       |
| Booking throughput      | 500 bookings/sec |
| Page load time (P95)    | < 2 seconds      |
| API response time (P95) | < 200ms          |
| Uptime SLA              | 99.9%            |

---

## 2. Current State Assessment

### Critical Gaps

| Area                  | Current State               | Problem                                    |
| --------------------- | --------------------------- | ------------------------------------------ |
| **Scaling**           | Single Node.js process      | One crash = total outage                   |
| **Caching**           | None — direct DB queries    | MySQL will collapse at 1k concurrent users |
| **Booking atomicity** | Single transaction          | Correct, but no queue protection           |
| **Auth**              | JWT only, no refresh tokens | Tokens can't be revoked                    |
| **Payments**          | Not implemented             | No real ticketing possible                 |
| **Emails**            | Not implemented             | No confirmation emails                     |
| **Real-time**         | 5-second polling            | Inefficient, stale data                    |
| **Rate limiting**     | None                        | Open to abuse                              |
| **Input validation**  | Partial, manual             | Inconsistent, security gaps                |
| **Error handling**    | Basic try/catch             | No structured error codes                  |
| **Logging**           | `console.log`               | No searchable structured logs              |
| **Monitoring**        | None                        | Blind to production issues                 |
| **Tests**             | None                        | Zero coverage                              |
| **Images**            | URL strings only            | No file upload support                     |
| **Search**            | None                        | No search feature                          |

### What to Keep

- The core data model concepts (users, events, bookings)
- The React + Vite + Tailwind frontend stack
- JWT authentication base
- MySQL as primary database
- Express.js framework

---

## 3. Target Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
│   Browser (React/Vite)    Mobile (future)    Webhook consumers   │
└──────────────────┬──────────────────────────────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────────────────────────────┐
│                     CDN (Cloudflare)                             │
│           Static assets, DDoS protection, edge caching           │
└──────────────────┬──────────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────────┐
│              Load Balancer (Nginx / AWS ALB)                     │
│                   Round-robin, health checks                     │
└──────┬───────────┬───────────────────────────────────────────────┘
       │           │
┌──────▼─┐    ┌───▼────┐    ┌─────────────────────────────────────┐
│ API    │    │ API    │    │         API Server N                  │
│ Server │    │ Server │... │   (Horizontally scalable instances)  │
│   1    │    │   2    │    └─────────────────────────────────────┘
└──┬─────┘    └─┬──────┘
   │             │
   └──────┬──────┘
          │
┌─────────▼────────────────────────────────────────────────────────┐
│                      INTERNAL SERVICES                            │
├────────────┬──────────┬───────────┬──────────┬───────────────────┤
│   MySQL    │  Redis   │   Bull    │ Meilisrc │  Cloudinary/S3    │
│  (RDS)     │  Cache   │  Queues   │  Search  │  (Image Storage)  │
│  Primary + │  + Rate  │  Email,   │          │                   │
│   Replica  │  Limit   │  Payment, │          │                   │
└────────────┴──────────┴───────────┴──────────┴───────────────────┘
          │
┌─────────▼────────────────────────────────────────────────────────┐
│                     WORKER PROCESSES                              │
│   EmailWorker    PaymentWorker    AnalyticsWorker    QRWorker    │
└──────────────────────────────────────────────────────────────────┘
          │
┌─────────▼────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                               │
│   Stripe/Razorpay    SendGrid    Google OAuth    Sentry          │
└──────────────────────────────────────────────────────────────────┘
```

### Technology Decisions

| Layer          | Technology                 | Rationale                              |
| -------------- | -------------------------- | -------------------------------------- |
| API server     | Node.js + Express 5        | Existing stack, non-blocking I/O       |
| Validation     | Zod                        | Type-safe, composable schemas          |
| ORM            | Prisma                     | Type-safe queries, migrations, schema  |
| Cache          | Redis (Upstash)            | Session store, rate limit, seat locks  |
| Queue          | BullMQ (Redis)             | Reliable job processing with retries   |
| Search         | Meilisearch                | Fast, typo-tolerant, easy to self-host |
| Realtime       | Socket.io                  | WebSocket with fallback, room-based    |
| Payments       | Razorpay (India) or Stripe | Webhook-driven confirmation            |
| Images         | Cloudinary                 | CDN + transformations built-in         |
| Email          | Nodemailer + SendGrid SMTP | Queue-backed, templated emails         |
| Frontend state | Zustand + React Query      | Simple global state + server cache     |
| Logging        | Pino                       | Structured JSON logs, very fast        |
| Monitoring     | Sentry + Prometheus        | Error tracking + metrics               |
| Deployment     | Docker + Railway/Render    | Containerized, easy horizontal scale   |

---

## 4. Improved Database Schema

### Design Principles

- Every table has `id`, `created_at`, `updated_at`
- Soft deletes (`deleted_at`) on critical tables — no data is ever permanently lost
- Foreign keys enforced at DB level
- Indexes on every column used in WHERE, JOIN, or ORDER BY
- Monetary values stored as `DECIMAL(12,2)` — never FLOAT
- Enum fields are MySQL ENUM type for storage efficiency

---

### `users`

```sql
CREATE TABLE users (
  id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),  -- UUID for security
  username      VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),                           -- NULL if OAuth-only user
  avatar_url    VARCHAR(500),
  phone         VARCHAR(20),
  role          ENUM('user', 'organizer', 'admin') DEFAULT 'user',
  is_verified   BOOLEAN DEFAULT FALSE,                  -- email verified
  is_active     BOOLEAN DEFAULT TRUE,
  oauth_provider ENUM('google', 'github') NULL,
  oauth_id       VARCHAR(255) NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    TIMESTAMP NULL,                         -- soft delete

  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_oauth (oauth_provider, oauth_id)
);
```

### `refresh_tokens`

```sql
CREATE TABLE refresh_tokens (
  id          CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id     CHAR(36) NOT NULL,
  token_hash  VARCHAR(255) NOT NULL UNIQUE,             -- hashed refresh token
  expires_at  TIMESTAMP NOT NULL,
  ip_address  VARCHAR(45),
  user_agent  VARCHAR(500),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at  TIMESTAMP NULL,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token_hash (token_hash)
);
```

### `events`

```sql
CREATE TABLE events (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  organizer_id    CHAR(36) NOT NULL,
  title           VARCHAR(255) NOT NULL,
  slug            VARCHAR(300) NOT NULL UNIQUE,          -- URL-friendly: "tech-summit-2025"
  description     TEXT,
  short_desc      VARCHAR(500),
  banner_url      VARCHAR(500),
  thumbnail_url   VARCHAR(500),
  date_start      DATETIME NOT NULL,
  date_end        DATETIME NOT NULL,
  timezone        VARCHAR(50) DEFAULT 'Asia/Kolkata',
  venue_name      VARCHAR(255),
  venue_address   TEXT,
  city            VARCHAR(100),
  state           VARCHAR(100),
  country         VARCHAR(100) DEFAULT 'India',
  lat             DECIMAL(10,7),
  lng             DECIMAL(10,7),
  category        ENUM('music','tech','sports','business','arts','food','education','health','other'),
  tags            JSON,                                  -- ["react","nodejs","frontend"]
  total_capacity  INT NOT NULL,
  available_seats INT NOT NULL,
  is_free         BOOLEAN DEFAULT FALSE,
  min_price       DECIMAL(12,2) DEFAULT 0.00,            -- for display
  status          ENUM('draft','published','cancelled','completed') DEFAULT 'draft',
  is_featured     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      TIMESTAMP NULL,
  published_at    TIMESTAMP NULL,

  FOREIGN KEY (organizer_id) REFERENCES users(id),
  INDEX idx_organizer (organizer_id),
  INDEX idx_date (date_start),
  INDEX idx_city (city),
  INDEX idx_category (category),
  INDEX idx_status (status),
  INDEX idx_slug (slug),
  FULLTEXT idx_search (title, description, short_desc, venue_name, city)
);
```

### `ticket_categories`

```sql
CREATE TABLE ticket_categories (
  id                    CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  event_id              CHAR(36) NOT NULL,
  name                  VARCHAR(100) NOT NULL,           -- "VIP", "Regular", "Student"
  description           VARCHAR(500),
  price                 DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_quantity        INT NOT NULL,
  available_quantity    INT NOT NULL,
  min_per_booking       INT DEFAULT 1,
  max_per_booking       INT DEFAULT 10,
  sale_starts_at        TIMESTAMP NULL,
  sale_ends_at          TIMESTAMP NULL,
  is_active             BOOLEAN DEFAULT TRUE,
  position              TINYINT DEFAULT 0,               -- display order
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  INDEX idx_event (event_id)
);
```

### `bookings`

```sql
CREATE TABLE bookings (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  booking_ref     VARCHAR(20) NOT NULL UNIQUE,           -- "EVT-2025-A3K9" (human readable)
  user_id         CHAR(36) NULL,                         -- NULL for guest bookings
  event_id        CHAR(36) NOT NULL,
  booker_name     VARCHAR(100) NOT NULL,
  booker_email    VARCHAR(255) NOT NULL,
  booker_phone    VARCHAR(20) NOT NULL,
  subtotal        DECIMAL(12,2) NOT NULL,
  platform_fee    DECIMAL(12,2) DEFAULT 0.00,
  total_amount    DECIMAL(12,2) NOT NULL,
  currency        CHAR(3) DEFAULT 'INR',
  status          ENUM('pending','confirmed','cancelled','refunded') DEFAULT 'pending',
  payment_status  ENUM('unpaid','paid','refunded','failed') DEFAULT 'unpaid',
  cancelled_at    TIMESTAMP NULL,
  cancel_reason   VARCHAR(500),
  notes           TEXT,
  ip_address      VARCHAR(45),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (event_id) REFERENCES events(id),
  INDEX idx_user (user_id),
  INDEX idx_event (event_id),
  INDEX idx_email (booker_email),
  INDEX idx_status (status),
  INDEX idx_booking_ref (booking_ref)
);
```

### `booking_items`

```sql
-- Each row = one ticket category in a booking (allows mixed categories)
CREATE TABLE booking_items (
  id                  CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  booking_id          CHAR(36) NOT NULL,
  ticket_category_id  CHAR(36) NOT NULL,
  quantity            INT NOT NULL,
  unit_price          DECIMAL(12,2) NOT NULL,            -- price at time of booking
  subtotal            DECIMAL(12,2) NOT NULL,

  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (ticket_category_id) REFERENCES ticket_categories(id),
  INDEX idx_booking (booking_id)
);
```

### `tickets`

```sql
-- One row per physical ticket (one booking_item with quantity=3 → 3 rows here)
CREATE TABLE tickets (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  ticket_number   VARCHAR(30) NOT NULL UNIQUE,           -- "TKT-EVT-2025-001"
  booking_id      CHAR(36) NOT NULL,
  booking_item_id CHAR(36) NOT NULL,
  event_id        CHAR(36) NOT NULL,
  holder_name     VARCHAR(100),
  qr_code         TEXT,                                  -- base64 encoded QR data
  seat_number     VARCHAR(20),                           -- optional
  status          ENUM('active','used','cancelled') DEFAULT 'active',
  checked_in_at   TIMESTAMP NULL,

  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (booking_item_id) REFERENCES booking_items(id),
  FOREIGN KEY (event_id) REFERENCES events(id),
  INDEX idx_booking (booking_id),
  INDEX idx_event (event_id),
  INDEX idx_ticket_number (ticket_number)
);
```

### `payments`

```sql
CREATE TABLE payments (
  id                  CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  booking_id          CHAR(36) NOT NULL,
  provider            ENUM('razorpay','stripe','free') NOT NULL,
  provider_order_id   VARCHAR(255),                      -- from payment gateway
  provider_payment_id VARCHAR(255),                      -- confirmed payment ID
  provider_signature  VARCHAR(500),                      -- webhook signature
  amount              DECIMAL(12,2) NOT NULL,
  currency            CHAR(3) DEFAULT 'INR',
  status              ENUM('created','captured','failed','refunded') DEFAULT 'created',
  raw_response        JSON,                              -- full gateway response stored
  refund_amount       DECIMAL(12,2) DEFAULT 0.00,
  refund_reason       VARCHAR(500),
  refunded_at         TIMESTAMP NULL,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  UNIQUE INDEX idx_provider_order (provider, provider_order_id),
  INDEX idx_booking (booking_id),
  INDEX idx_status (status)
);
```

### `reviews`

```sql
CREATE TABLE reviews (
  id          CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  event_id    CHAR(36) NOT NULL,
  user_id     CHAR(36) NOT NULL,
  booking_id  CHAR(36) NOT NULL,                        -- must have a booking to review
  rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       VARCHAR(200),
  body        TEXT,
  is_verified BOOLEAN DEFAULT FALSE,                    -- attended the event
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  UNIQUE INDEX idx_user_event (user_id, event_id),      -- one review per user per event
  INDEX idx_event (event_id)
);
```

### `wishlists`

```sql
CREATE TABLE wishlists (
  id          CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id     CHAR(36) NOT NULL,
  event_id    CHAR(36) NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  UNIQUE INDEX idx_user_event (user_id, event_id)
);
```

### `notifications`

```sql
CREATE TABLE notifications (
  id          CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id     CHAR(36) NOT NULL,
  type        ENUM('booking_confirmed','booking_cancelled','event_reminder',
                   'event_updated','refund_processed','review_reply') NOT NULL,
  title       VARCHAR(255) NOT NULL,
  message     TEXT,
  data        JSON,                                     -- extra context
  is_read     BOOLEAN DEFAULT FALSE,
  sent_via    SET('in_app','email','sms'),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_read (user_id, is_read)
);
```

### `audit_logs`

```sql
CREATE TABLE audit_logs (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,         -- BIGINT for high volume
  user_id     CHAR(36) NULL,
  action      VARCHAR(100) NOT NULL,                    -- "booking.created"
  entity_type VARCHAR(50),                              -- "booking"
  entity_id   CHAR(36),
  old_value   JSON,
  new_value   JSON,
  ip_address  VARCHAR(45),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_user (user_id),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created (created_at)
);
```

---

## 5. Backend Architecture

### Folder Structure

```
backend/
├── .env.example
├── .env
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json               ← TypeScript (recommended upgrade)
├── prisma/
│   ├── schema.prisma           ← Single source of truth for DB
│   └── migrations/             ← Auto-generated migration files
└── src/
    ├── app.ts                  ← Express app factory (no listen)
    ├── server.ts               ← HTTP server entry point
    ├── config/
    │   ├── index.ts            ← Consolidates all config from env
    │   ├── database.ts         ← Prisma client singleton
    │   ├── redis.ts            ← Redis client singleton
    │   └── bullmq.ts           ← Queue definitions
    ├── modules/                ← Feature modules (clean separation)
    │   ├── auth/
    │   │   ├── auth.controller.ts
    │   │   ├── auth.service.ts
    │   │   ├── auth.repository.ts
    │   │   ├── auth.routes.ts
    │   │   ├── auth.validator.ts   ← Zod schemas
    │   │   └── auth.types.ts
    │   ├── users/
    │   │   ├── users.controller.ts
    │   │   ├── users.service.ts
    │   │   ├── users.repository.ts
    │   │   ├── users.routes.ts
    │   │   └── users.validator.ts
    │   ├── events/
    │   │   ├── events.controller.ts
    │   │   ├── events.service.ts
    │   │   ├── events.repository.ts
    │   │   ├── events.routes.ts
    │   │   └── events.validator.ts
    │   ├── bookings/
    │   │   ├── bookings.controller.ts
    │   │   ├── bookings.service.ts
    │   │   ├── bookings.repository.ts
    │   │   ├── bookings.routes.ts
    │   │   └── bookings.validator.ts
    │   ├── payments/
    │   │   ├── payments.controller.ts
    │   │   ├── payments.service.ts
    │   │   ├── razorpay.service.ts
    │   │   ├── stripe.service.ts
    │   │   ├── payments.routes.ts
    │   │   └── webhook.handler.ts
    │   ├── tickets/
    │   │   ├── tickets.controller.ts
    │   │   ├── tickets.service.ts
    │   │   └── qrcode.service.ts
    │   ├── notifications/
    │   │   ├── notifications.controller.ts
    │   │   ├── notifications.service.ts
    │   │   └── email.templates.ts
    │   ├── reviews/
    │   │   ├── reviews.controller.ts
    │   │   ├── reviews.service.ts
    │   │   └── reviews.routes.ts
    │   ├── search/
    │   │   ├── search.controller.ts
    │   │   └── meilisearch.service.ts
    │   └── analytics/
    │       ├── analytics.controller.ts
    │       └── analytics.service.ts
    ├── middleware/
    │   ├── authenticate.ts         ← JWT verification
    │   ├── authorize.ts            ← Role check factory
    │   ├── rateLimiter.ts          ← Redis-backed rate limiting
    │   ├── validate.ts             ← Zod request validation
    │   ├── errorHandler.ts         ← Centralized error response
    │   ├── requestLogger.ts        ← Pino request logging
    │   └── upload.ts               ← Multer + Cloudinary
    ├── jobs/                       ← BullMQ job processors
    │   ├── email.job.ts
    │   ├── payment.job.ts
    │   ├── qrcode.job.ts
    │   └── analytics.job.ts
    ├── queues/
    │   ├── email.queue.ts
    │   ├── payment.queue.ts
    │   └── notification.queue.ts
    ├── websockets/
    │   ├── socket.server.ts        ← Socket.io setup
    │   └── events.gateway.ts       ← Seat availability room handlers
    ├── utils/
    │   ├── AppError.ts             ← Custom error class
    │   ├── asyncHandler.ts         ← Wraps async controllers
    │   ├── pagination.ts           ← Cursor/offset pagination helpers
    │   ├── slugify.ts
    │   ├── bookingRef.ts           ← "EVT-2025-A3K9" generator
    │   └── logger.ts               ← Pino logger instance
    └── types/
        ├── express.d.ts            ← Augment req.user type
        └── index.ts
```

### Clean Architecture Layer Rules

```
Controller  →  receives HTTP request, calls Service, returns response
Service     →  business logic, orchestrates repositories, throws AppError
Repository  →  database queries only, returns domain objects
Middleware  →  cross-cutting concerns (auth, validation, logging)
Job         →  async background tasks (email, payment webhook)
```

**Rule:** Controllers never call repositories directly. Repositories never contain business logic. Services never import `req`/`res`.

---

## 6. Frontend Architecture

### Folder Structure

```
frontend/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── src/
    ├── main.tsx                    ← React root, providers setup
    ├── App.tsx                     ← Routes
    ├── index.css
    ├── components/                 ← Truly generic, no feature knowledge
    │   ├── ui/
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── Badge.tsx
    │   │   ├── Input.tsx
    │   │   ├── Modal.tsx
    │   │   ├── Toast.tsx
    │   │   ├── Spinner.tsx
    │   │   ├── Avatar.tsx
    │   │   ├── Skeleton.tsx
    │   │   ├── Pagination.tsx
    │   │   ├── Tabs.tsx
    │   │   └── index.ts
    │   └── forms/
    │       ├── FormField.tsx
    │       └── Select.tsx
    ├── features/                   ← Feature-specific components & logic
    │   ├── auth/
    │   │   ├── LoginForm.tsx
    │   │   ├── RegisterForm.tsx
    │   │   ├── OAuthButton.tsx
    │   │   └── useAuth.ts          ← Auth-specific hook
    │   ├── events/
    │   │   ├── EventCard.tsx
    │   │   ├── EventGrid.tsx
    │   │   ├── EventFilters.tsx
    │   │   ├── EventSearchBar.tsx
    │   │   ├── EventDetailHero.tsx
    │   │   ├── TicketSelector.tsx
    │   │   └── useEvents.ts
    │   ├── bookings/
    │   │   ├── BookingForm.tsx
    │   │   ├── BookingCard.tsx
    │   │   ├── BookingTimeline.tsx
    │   │   └── useBookings.ts
    │   ├── payments/
    │   │   ├── PaymentModal.tsx
    │   │   ├── OrderSummary.tsx
    │   │   └── usePayment.ts
    │   ├── tickets/
    │   │   ├── TicketCard.tsx
    │   │   ├── QRCode.tsx
    │   │   └── DownloadTicket.tsx
    │   ├── reviews/
    │   │   ├── ReviewCard.tsx
    │   │   ├── ReviewForm.tsx
    │   │   └── RatingStars.tsx
    │   ├── admin/
    │   │   ├── StatsCard.tsx
    │   │   ├── BookingsTable.tsx
    │   │   ├── RevenueChart.tsx
    │   │   ├── UserTable.tsx
    │   │   └── EventManagement.tsx
    │   └── notifications/
    │       ├── NotificationBell.tsx
    │       └── NotificationList.tsx
    ├── pages/
    │   ├── Home.tsx
    │   ├── EventsPage.tsx
    │   ├── EventDetailPage.tsx
    │   ├── LoginPage.tsx
    │   ├── RegisterPage.tsx
    │   ├── CheckoutPage.tsx
    │   ├── BookingSuccessPage.tsx
    │   ├── MyBookingsPage.tsx
    │   ├── TicketPage.tsx
    │   ├── WishlistPage.tsx
    │   ├── ProfilePage.tsx
    │   └── admin/
    │       ├── DashboardPage.tsx
    │       ├── EventsManagePage.tsx
    │       ├── BookingsManagePage.tsx
    │       ├── UsersManagePage.tsx
    │       └── AnalyticsPage.tsx
    ├── layouts/
    │   ├── RootLayout.tsx          ← Navbar + Footer
    │   ├── AuthLayout.tsx          ← Centered card layout
    │   └── AdminLayout.tsx         ← Sidebar + topbar
    ├── hooks/                      ← Global reusable hooks
    │   ├── useDebounce.ts
    │   ├── useIntersectionObserver.ts
    │   ├── useLocalStorage.ts
    │   ├── useSocket.ts            ← WebSocket connection
    │   └── usePagination.ts
    ├── store/                      ← Zustand stores
    │   ├── authStore.ts            ← user, token, isAuthenticated
    │   ├── cartStore.ts            ← ticket selection before payment
    │   └── uiStore.ts              ← modal state, toasts
    ├── services/                   ← Axios service layer (React Query feeds from here)
    │   ├── api.ts                  ← Axios instance + interceptors
    │   ├── auth.service.ts
    │   ├── events.service.ts
    │   ├── bookings.service.ts
    │   ├── payments.service.ts
    │   └── tickets.service.ts
    ├── lib/
    │   ├── queryClient.ts          ← React Query client config
    │   └── socket.ts               ← Socket.io client singleton
    └── utils/
        ├── format.ts               ← Currency, dates, numbers
        ├── validators.ts           ← Client-side Zod schemas
        └── constants.ts
```

### State Management Strategy

| State Type            | Tool                | Example                               |
| --------------------- | ------------------- | ------------------------------------- |
| Server data (fetched) | React Query         | Event list, bookings, user profile    |
| Global auth state     | Zustand `authStore` | `user`, `isAuthenticated`, `logout()` |
| UI ephemeral state    | `useState`          | Modal open/close, form inputs         |
| Cart/checkout state   | Zustand `cartStore` | Selected ticket category, quantity    |
| Toast messages        | Zustand `uiStore`   | Success/error toasts                  |

**React Query** handles: caching, background refetch, stale-while-revalidate, optimistic updates, infinite scroll.

**Zustand** handles: auth state that persists across navigation, checkout cart that survives re-renders.

---

## 7. API Design

### Conventions

- Versioned: `/api/v1/`
- RESTful naming: nouns, not verbs
- Cursor-based pagination for feeds; offset for admin tables
- Consistent envelope for all responses
- HTTP status codes used correctly (201 for created, 204 for delete, 409 for conflict)

### Standard Response Envelope

```json
// Success
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 150, "next_cursor": "abc123" }
}

// Error
{
  "success": false,
  "error": {
    "code": "BOOKING_SEATS_UNAVAILABLE",
    "message": "Only 2 seats are available for this event.",
    "details": { "available": 2, "requested": 5 }
  }
}
```

### Error Code Registry

| Code                        | HTTP | Meaning                      |
| --------------------------- | ---- | ---------------------------- |
| `AUTH_TOKEN_MISSING`        | 401  | No Authorization header      |
| `AUTH_TOKEN_INVALID`        | 401  | JWT verify failed            |
| `AUTH_TOKEN_EXPIRED`        | 401  | JWT expired, use refresh     |
| `AUTH_FORBIDDEN`            | 403  | Authenticated but wrong role |
| `VALIDATION_ERROR`          | 422  | Zod schema failed            |
| `NOT_FOUND`                 | 404  | Resource does not exist      |
| `BOOKING_SEATS_UNAVAILABLE` | 409  | Not enough seats             |
| `BOOKING_ALREADY_CANCELLED` | 409  | Double cancel attempt        |
| `PAYMENT_FAILED`            | 402  | Payment gateway error        |
| `RATE_LIMIT_EXCEEDED`       | 429  | Too many requests            |
| `INTERNAL_ERROR`            | 500  | Unexpected server error      |

### Complete Route Table

#### Auth (`/api/v1/auth`)

| Method | Path               | Auth | Description                                 |
| ------ | ------------------ | ---- | ------------------------------------------- |
| POST   | `/register`        | —    | Register with email/password                |
| POST   | `/login`           | —    | Login, returns access + refresh tokens      |
| POST   | `/refresh`         | —    | Exchange refresh token for new access token |
| POST   | `/logout`          | JWT  | Revoke refresh token                        |
| GET    | `/me`              | JWT  | Get current user                            |
| GET    | `/google`          | —    | Initiate Google OAuth                       |
| GET    | `/google/callback` | —    | Google OAuth callback                       |
| POST   | `/verify-email`    | —    | Verify email with token                     |
| POST   | `/forgot-password` | —    | Send password reset email                   |
| POST   | `/reset-password`  | —    | Reset password with token                   |

#### Users (`/api/v1/users`)

| Method | Path                      | Auth  | Description                    |
| ------ | ------------------------- | ----- | ------------------------------ |
| GET    | `/profile`                | JWT   | Get own profile                |
| PATCH  | `/profile`                | JWT   | Update profile                 |
| POST   | `/avatar`                 | JWT   | Upload avatar to Cloudinary    |
| GET    | `/notifications`          | JWT   | List notifications (paginated) |
| PATCH  | `/notifications/:id/read` | JWT   | Mark notification read         |
| GET    | `/`                       | Admin | List all users                 |
| PATCH  | `/:id/status`             | Admin | Activate/deactivate user       |

#### Events (`/api/v1/events`)

| Method | Path                            | Auth            | Description                                                      |
| ------ | ------------------------------- | --------------- | ---------------------------------------------------------------- |
| GET    | `/`                             | —               | List events (filters: city, category, date, price range, status) |
| GET    | `/:slug`                        | —               | Get event by slug                                                |
| POST   | `/`                             | Organizer/Admin | Create event (status: draft)                                     |
| PATCH  | `/:id`                          | Organizer/Admin | Update event                                                     |
| DELETE | `/:id`                          | Organizer/Admin | Soft delete event                                                |
| POST   | `/:id/publish`                  | Organizer/Admin | Publish event                                                    |
| POST   | `/:id/banner`                   | Organizer/Admin | Upload banner image                                              |
| GET    | `/:id/ticket-categories`        | —               | List ticket categories                                           |
| POST   | `/:id/ticket-categories`        | Organizer/Admin | Create ticket category                                           |
| PATCH  | `/:id/ticket-categories/:catId` | Organizer/Admin | Update category                                                  |
| GET    | `/:id/reviews`                  | —               | List reviews for event                                           |
| POST   | `/:id/reviews`                  | JWT             | Submit review (must have booking)                                |
| GET    | `/search?q=&city=`              | —               | Full-text search via Meilisearch                                 |
| POST   | `/:id/wishlist`                 | JWT             | Add to wishlist                                                  |
| DELETE | `/:id/wishlist`                 | JWT             | Remove from wishlist                                             |

#### Bookings (`/api/v1/bookings`)

| Method | Path          | Auth         | Description                                      |
| ------ | ------------- | ------------ | ------------------------------------------------ |
| POST   | `/`           | — (guest ok) | Create booking (returns pending + payment order) |
| GET    | `/`           | Admin        | List all bookings (paginated, filterable)        |
| GET    | `/my`         | JWT          | Current user's bookings                          |
| GET    | `/:id`        | JWT          | Get single booking                               |
| POST   | `/:id/cancel` | JWT          | Cancel booking                                   |
| GET    | `/ref/:ref`   | —            | Lookup booking by reference number               |

#### Payments (`/api/v1/payments`)

| Method | Path                | Auth  | Description                                    |
| ------ | ------------------- | ----- | ---------------------------------------------- |
| POST   | `/create-order`     | —     | Create Razorpay/Stripe order                   |
| POST   | `/verify`           | —     | Verify payment signature (client-side confirm) |
| POST   | `/webhook/razorpay` | —     | Razorpay webhook (HMAC verified)               |
| POST   | `/webhook/stripe`   | —     | Stripe webhook (signature verified)            |
| POST   | `/:id/refund`       | Admin | Process refund                                 |

#### Tickets (`/api/v1/tickets`)

| Method | Path                      | Auth            | Description               |
| ------ | ------------------------- | --------------- | ------------------------- |
| GET    | `/booking/:bookingId`     | JWT             | Get tickets for a booking |
| GET    | `/:ticketNumber`          | JWT             | Get single ticket with QR |
| GET    | `/:ticketNumber/download` | JWT             | Download PDF ticket       |
| POST   | `/:ticketNumber/checkin`  | Organizer/Admin | Check in attendee at door |

#### Admin (`/api/v1/admin`)

| Method | Path                  | Auth  | Description                       |
| ------ | --------------------- | ----- | --------------------------------- |
| GET    | `/analytics/overview` | Admin | Revenue, bookings, users summary  |
| GET    | `/analytics/events`   | Admin | Event performance metrics         |
| GET    | `/analytics/revenue`  | Admin | Revenue over time (Recharts data) |
| GET    | `/reports/bookings`   | Admin | CSV export                        |

---

## 8. Authentication & Authorization

### Token Strategy

```
Access Token:
  - Short-lived: 15 minutes
  - Payload: { sub: userId, email, role, jti }
  - Stored: memory (not localStorage) — avoids XSS token theft
  - Transmitted: Authorization: Bearer header

Refresh Token:
  - Long-lived: 30 days
  - Stored: HttpOnly, Secure, SameSite=Strict cookie
  - DB record: refresh_tokens table (can be revoked)
  - Rotation: each refresh call issues new refresh token, revokes old one
```

### Why this beats the current implementation

| Current                    | Production                                              |
| -------------------------- | ------------------------------------------------------- |
| 7-day JWT in localStorage  | 15-min JWT in memory, 30-day refresh in HttpOnly cookie |
| Token can never be revoked | Refresh token can be revoked (logout all devices)       |
| No refresh mechanism       | Automatic silent token refresh via interceptor          |
| Single `admin` role        | `user`, `organizer`, `admin` roles                      |

### OAuth Flow (Google)

```
1. User clicks "Login with Google"
2. Frontend → GET /api/v1/auth/google
3. Server redirects to Google OAuth consent
4. Google → GET /api/v1/auth/google/callback?code=...
5. Server exchanges code for profile
6. Server upserts user in DB (create if new, update if existing)
7. Server issues own JWT + refresh token
8. Server redirects to frontend with access token in URL fragment (#token=...)
9. Frontend extracts token from fragment and stores in memory
10. Fragment never hits server logs
```

### Authorization Middleware

```javascript
// authorize.ts — factory for role-based middleware
export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError('AUTH_FORBIDDEN', 403, 'Insufficient permissions');
    }
    next();
  };
};

// Usage in routes:
router.post('/events', authenticate, authorize('organizer', 'admin'), createEvent);
router.get('/admin/analytics', authenticate, authorize('admin'), getAnalytics);
```

---

## 9. Payment System

### Flow Architecture

```
User selects tickets
        ↓
POST /bookings           → Creates booking (status: pending)
                           Creates payment record (status: created)
                           Returns: { bookingId, orderId, amount }
        ↓
Frontend opens Razorpay checkout modal
        ↓
User pays
        ↓
Razorpay SDK fires        → POST /payments/verify
                             Server verifies HMAC signature
                             If valid: updates payment → 'captured'
                             Updates booking → 'confirmed'
                             Decrements ticket_categories.available_quantity
                             Enqueues: EmailJob, QRCodeJob
                             Returns: { success, bookingRef }
        ↓                         ↓
Frontend shows success     EmailWorker sends confirmation
page with confetti         QRCodeWorker generates QR + stores
        ↓
        └─ Razorpay also fires webhook (backup confirmation)
           POST /payments/webhook/razorpay
           Server processes idempotently (check if already confirmed)
```

### Why webhook as backup?

Network failures can prevent the client-side verify call from reaching the server even after payment succeeds. The webhook is Razorpay server → your server, which is far more reliable. Both paths write confirm — whichever arrives first wins; the second is a no-op (idempotency check).

### Refund Flow

```
Admin clicks "Refund" on dashboard
        ↓
POST /payments/:id/refund
        ↓
PaymentService.refund()
  1. Verify booking is cancellable
  2. Call Razorpay.refunds.create({ payment_id, amount })
  3. Update payment.status = 'refunded', payment.refund_amount
  4. Update booking.status = 'refunded'
  5. Restore available_seats on event
  6. Enqueue RefundEmailJob
```

---

## 10. Ticket & QR Code System

### Ticket Identifier Structure

```
Ticket number format: TKT-{EVENTCODE}-{YEAR}-{RANDOM6}
Example:             TKT-TECH-2025-A3K9F1

QR Code payload (JSON, signed with HMAC):
{
  "ticketId": "uuid",
  "ticketNumber": "TKT-TECH-2025-A3K9F1",
  "eventId": "uuid",
  "eventName": "Tech Summit 2025",
  "holderName": "John Doe",
  "category": "VIP",
  "seat": "A12",
  "issuedAt": 1720000000,
  "signature": "hmac-sha256-of-above-fields"
}
```

### QR Generation Pipeline

```
Booking confirmed
      ↓
QRCodeJob added to Bull queue
      ↓
QRCodeWorker:
  1. Generate HMAC-signed JSON payload
  2. Generate QR PNG using 'qrcode' npm package
  3. Upload QR PNG to Cloudinary
  4. Store QR URL + payload in tickets table
  5. Generate PDF using 'pdfkit'
     - Event banner, name, date, location
     - Holder name, category
     - QR code image embedded
     - Ticket number as barcode (optional)
  6. Upload PDF to Cloudinary
  7. Notify frontend via WebSocket: { ticketReady: true }
```

### Check-in at Venue

```
Organizer scans QR code at door using any QR scanner app
      ↓
App sends QR payload to: POST /tickets/:ticketNumber/checkin
      ↓
Server:
  1. Verifies HMAC signature (can't be forged)
  2. Checks ticket.status === 'active'
  3. Checks event date is today
  4. Sets ticket.status = 'used', checked_in_at = NOW()
  5. Returns { valid: true, holderName, category, seat }
```

---

## 11. Notification System

### Email Templates

All emails are HTML templates stored in `src/modules/notifications/email.templates.ts`:

| Template            | Trigger                     |
| ------------------- | --------------------------- |
| `booking_confirmed` | Payment verified            |
| `booking_cancelled` | User cancels                |
| `refund_processed`  | Admin refunds               |
| `event_reminder`    | 24h before event (cron job) |
| `event_cancelled`   | Organizer cancels event     |
| `welcome`           | New user registration       |
| `password_reset`    | Forgot password flow        |

### Queue-Based Email Sending

```javascript
// Enqueuing an email (never send directly in request cycle)
await emailQueue.add(
  "booking_confirmed",
  {
    to: booking.booker_email,
    templateId: "booking_confirmed",
    data: {
      name: booking.booker_name,
      eventName: event.title,
      bookingRef: booking.booking_ref,
      eventDate: event.date_start,
      ticketCount: booking.total_tickets,
      totalAmount: booking.total_amount,
      ticketDownloadUrl: `${BASE_URL}/tickets/${booking.id}`,
    },
  },
  {
    attempts: 3, // retry 3 times on failure
    backoff: { type: "exponential", delay: 5000 },
  },
);
```

### Event Reminder Cron Job

```
Every hour: SELECT events WHERE date_start BETWEEN NOW() AND NOW() + 25h
For each event:
  Get all confirmed bookings
  For each booking:
    If reminder not sent (check notifications table):
      Enqueue reminder email
      Insert notification record
```

---

## 12. Real-Time System

### Socket.io Architecture

Replace 5-second polling with WebSocket rooms.

```javascript
// server.ts
const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL },
  adapter: createAdapter(redisClient), // Redis adapter for multi-instance
});

// events.gateway.ts
io.on("connection", (socket) => {
  // Client joins event room to receive seat updates
  socket.on("join:event", (eventId) => {
    socket.join(`event:${eventId}`);
  });

  socket.on("leave:event", (eventId) => {
    socket.leave(`event:${eventId}`);
  });
});

// Emit from booking service after successful booking:
io.to(`event:${eventId}`).emit("seats:updated", {
  eventId,
  availableSeats: updatedEvent.available_seats,
  ticketCategories: updatedCategories,
});
```

### Why Redis Adapter?

When running 3 API server instances, a Socket.io event emitted by instance #1 won't reach clients connected to instance #2. The Redis adapter broadcasts via Redis pub/sub so all instances share events.

### Frontend WebSocket Hook

```typescript
// hooks/useSocket.ts
export const useEventSocket = (eventId: string) => {
  const [availableSeats, setAvailableSeats] = useState<number | null>(null);
  const socket = useSocket(); // singleton

  useEffect(() => {
    socket.emit("join:event", eventId);
    socket.on("seats:updated", (data) => {
      if (data.eventId === eventId) {
        setAvailableSeats(data.availableSeats);
      }
    });
    return () => {
      socket.emit("leave:event", eventId);
      socket.off("seats:updated");
    };
  }, [eventId]);

  return { availableSeats };
};
```

---

## 13. Search System

### Meilisearch Setup

Meilisearch is a fast, typo-tolerant search engine that's easy to self-host on a single 1GB RAM instance or use via Meilisearch Cloud.

### Index Configuration

```javascript
// On server start: sync events to Meilisearch index
const eventsIndex = client.index("events");

await eventsIndex.updateSettings({
  searchableAttributes: [
    "title",
    "short_desc",
    "venue_name",
    "city",
    "organizer_name",
    "tags",
  ],
  filterableAttributes: ["category", "city", "status", "is_free", "date_start"],
  sortableAttributes: ["date_start", "min_price", "total_capacity"],
  rankingRules: [
    "words",
    "typo",
    "proximity",
    "attribute",
    "sort",
    "exactness",
  ],
});
```

### Search API Usage

```
GET /api/v1/events/search
  ?q=react conference
  &city=Mumbai
  &category=tech
  &is_free=false
  &date_from=2025-08-01
  &date_to=2025-12-31
  &sort=date_start:asc
  &page=1
  &limit=20
```

### Index Sync Strategy

- On event **created/updated/published**: add/update document in Meilisearch
- On event **deleted**: remove document from Meilisearch
- Nightly full re-sync job as safety net

---

## 14. Caching Strategy

### What to Cache in Redis

| Data              | Cache Key Pattern               | TTL    | Invalidation        |
| ----------------- | ------------------------------- | ------ | ------------------- |
| Event details     | `event:{id}`                    | 5 min  | On event update     |
| Events list       | `events:list:{hash_of_filters}` | 2 min  | On any event update |
| Ticket categories | `event:{id}:categories`         | 5 min  | On category update  |
| User profile      | `user:{id}:profile`             | 10 min | On profile update   |
| Available seats   | `event:{id}:seats`              | 30 sec | On each booking     |

### Seat Count Cache (Critical Path)

Available seat count is the hottest data — checked on every booking attempt.

```javascript
// Redis-first seat count
async function getAvailableSeats(eventId: string): Promise<number> {
  const cached = await redis.get(`event:${eventId}:seats`);
  if (cached !== null) return parseInt(cached);

  const event = await db.event.findUnique({ where: { id: eventId } });
  await redis.setex(`event:${eventId}:seats`, 30, event.available_seats.toString());
  return event.available_seats;
}

// After booking: update cache atomically
await redis.decrby(`event:${eventId}:seats`, quantity);
```

### Rate Limiting (Redis-backed)

```javascript
// 3 tiers of rate limiting:

// Tier 1: Global IP limiter (all routes)
rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }); // 300 req / 15 min per IP

// Tier 2: Auth routes (prevent brute force)
rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }); // 10 login attempts / 15 min

// Tier 3: Booking endpoint
rateLimit({ windowMs: 60 * 1000, max: 5 }); // 5 booking attempts / min per IP
```

---

## 15. Security Model

### Full Security Stack

```
Layer 1: CDN (Cloudflare)
  - DDoS mitigation
  - IP reputation blocking
  - Bot detection
  - Rate limiting at edge

Layer 2: Load Balancer
  - SSL termination
  - Enforce HTTPS

Layer 3: API Server (Express middleware stack)
  - helmet()                    → Sets 12 security HTTP headers
  - cors(strict origin list)    → Only frontend domain allowed
  - express-rate-limit          → IP-based rate limiting (Redis store)
  - hpp()                       → HTTP Parameter Pollution protection
  - express-mongo-sanitize      → NoSQL injection prevention (belt+suspenders)

Layer 4: Authentication
  - JWT (15-min access, 30-day refresh in HttpOnly cookie)
  - HMAC webhook signature verification
  - bcrypt (12 rounds) for passwords

Layer 5: Input Validation (Zod)
  - Every incoming request body validated against strict schema
  - Unknown fields stripped (z.object({}).strict())
  - SQL injection: Prisma uses parameterized queries exclusively

Layer 6: Output
  - Never expose stack traces in production (NODE_ENV check)
  - Never expose internal IDs where UUIDs are possible
  - Sensitive fields stripped from responses (password_hash never returned)
```

### Helmet Headers Applied

```
Content-Security-Policy: default-src 'self'; img-src *; script-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=31536000; includeSubDomains
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### CSRF Protection

Since JWTs are sent via `Authorization` header (not cookies for access token), CSRF is not a concern for API calls. The refresh token lives in HttpOnly cookie but the CSRF issue is mitigated with:

- `SameSite=Strict` on refresh token cookie
- Custom header check (`X-Requested-With: XMLHttpRequest`)

---

## 16. Scalability & Performance

### Horizontal Scaling Plan

```
Phase 1 (0-10k users):      Single server + MySQL + Redis
Phase 2 (10k-50k users):    2-3 API servers + Load balancer + MySQL read replica
Phase 3 (50k-100k users):   5+ API servers + MySQL RDS (Multi-AZ) + Redis Cluster
Phase 4 (100k+ users):      Microservices split by feature domain
```

### Database Optimization

```sql
-- Critical indexes for booking throughput:
CREATE INDEX idx_events_available ON events(available_seats, status);
CREATE INDEX idx_bookings_status ON bookings(event_id, status, created_at);
CREATE INDEX idx_ticket_cat_available ON ticket_categories(event_id, available_quantity);

-- Read replica routing:
-- Writes: Primary MySQL
-- Reads: Replica MySQL (events list, booking history, analytics)
-- Hot reads: Redis cache (seat counts, event details)
```

### Connection Pooling

```
API Server → Prisma → PgBouncer/MySQL Proxy → MySQL Primary
                                            ↘ MySQL Replica

Each API instance: 10 DB connections
3 API instances: 30 total connections
MySQL max_connections: 500 (plenty of headroom)
```

### Background Job Queues (BullMQ)

Never do these in the request lifecycle:

```
❌ Send email during POST /bookings
❌ Generate QR code during POST /bookings
❌ Update analytics during GET /events
❌ Index to Meilisearch during POST /events

✅ API returns 201 immediately
✅ EmailWorker processes async (p99 < 30 seconds)
✅ QRCodeWorker processes async (p99 < 10 seconds)
✅ AnalyticsWorker batches updates every minute
```

### CDN Strategy

```
All event images served via Cloudinary CDN
All ticket PDFs served via Cloudinary CDN
All static frontend assets served via Vercel Edge Network
API on subdomain: api.eventbooking.com (separate from frontend)
```

---

## 17. UI/UX Design System

### Design Philosophy

**Fast, clean, trustworthy.** The user came to book a ticket, not admire animations. Every interaction should feel immediate and rewarding without being distracting.

### Color System (Tailwind Extension)

```javascript
// tailwind.config.ts
colors: {
  brand: {
    50:  '#f0f4ff',  // lightest tint
    100: '#e0e9ff',
    500: '#6366f1',  // primary (Indigo)
    600: '#4f46e5',
    900: '#312e81',  // darkest
  },
  accent: {
    500: '#8b5cf6',  // Violet accent
    600: '#7c3aed',
  },
  surface: {
    DEFAULT: '#ffffff',
    muted:   '#f8fafc',   // light backgrounds
    border:  '#e2e8f0',
  },
  text: {
    primary:   '#0f172a',
    secondary: '#475569',
    muted:     '#94a3b8',
  }
}
```

### Typography Scale

- Display (page heroes): `font-display` — Poppins 700, 56-72px
- Heading: `font-display` — Poppins 600, 24-40px
- Body: `font-sans` — Inter 400/500, 14-16px
- Mono (booking refs, ticket IDs): `font-mono` — JetBrains Mono 500

### Glassmorphism Cards (used sparingly)

```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.07);
}
```

**Where to use:** Hero section overlays, payment modal, booking summary sidebar.
**Not on:** Regular event cards (too heavy, slows GPU).

### Animation Rules

| Type               | Tool                             | Duration       | When                  |
| ------------------ | -------------------------------- | -------------- | --------------------- |
| Page enter         | Framer Motion `AnimatePresence`  | 300ms          | Every route change    |
| Card hover         | Tailwind `hover:-translate-y-1`  | 200ms          | Event cards           |
| Button press       | Tailwind `active:scale-95`       | 100ms          | All buttons           |
| Modal open         | Framer Motion `scale: 0.97→1`    | 200ms ease-out | Modals                |
| Success page       | Framer Motion stagger + confetti | 600ms          | Booking success       |
| Skeleton load      | `animate-pulse`                  | —              | Loading states        |
| Seat count update  | Number transition (CSS)          | 400ms          | After WebSocket event |
| Toast notification | Slide from top-right             | 300ms          | All notifications     |

**Rule:** No animation > 500ms on interactions. Decorative animations (confetti, success) can be longer.

### Mobile-First Responsive Breakpoints

```
Default (mobile):  < 640px   — Single column, bottom-sheet modals
sm (tablet):       640px+    — 2-column grids
lg (desktop):      1024px+   — 3-column event grid, sidebar layouts
xl (wide):         1280px+   — Max 7xl container width
```

### Key Component Patterns

**Event Card:** Image top, date chip overlay (bottom-left), status badge (top-right), availability bar at bottom. Hover: lift (-4px) + shadow deepen.

**Ticket Selector:** Accordion per category. Shows name, price, description, min/max per booking. Quantity stepper (−/+). Live total updates below.

**Checkout Page:** Two-column: left = order summary; right = payment form. Mobile: order summary collapses to accordion.

**Admin Dashboard:** Sidebar navigation (icon + label), collapsible on mobile. Recharts for revenue line chart (monthly). Data tables with column sort + inline actions.

---

## 18. DevOps & Deployment

### Docker Setup

**`backend/Dockerfile`:**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
EXPOSE 9000
USER node
CMD ["node", "dist/server.js"]
```

**`docker-compose.yml` (local development):**

```yaml
version: "3.9"
services:
  api:
    build: ./backend
    ports: ["9000:9000"]
    environment:
      - DATABASE_URL=mysql://root:root@mysql:3306/event_booking_db
      - REDIS_URL=redis://redis:6379
    depends_on: [mysql, redis]

  worker:
    build: ./backend
    command: node dist/worker.js
    depends_on: [mysql, redis]

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: event_booking_db
    volumes: [mysql_data:/var/lib/mysql]
    ports: ["3306:3306"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  meilisearch:
    image: getmeili/meilisearch:latest
    ports: ["7700:7700"]
    environment:
      - MEILI_MASTER_KEY=your_secret_key

volumes:
  mysql_data:
```

### Production Deployment Architecture

```
Frontend  → Vercel (auto-deploy on main branch push)
           - Edge network, global CDN
           - PR preview deployments automatically

Backend   → Railway.app or Render.com
           - Dockerfile-based deployment
           - Auto-scale based on CPU/memory
           - Environment variables in dashboard
           - Multiple replicas with load balancing

Database  → PlanetScale (MySQL-compatible, serverless)
           OR AWS RDS MySQL 8.0 (Multi-AZ)
           - Automated backups daily
           - Read replica in same region

Redis     → Upstash Redis
           - Serverless, pay-per-request
           - Global replication available

Meilisearch → Meilisearch Cloud
           OR self-hosted on smallest Hetzner VPS (€4/mo)

Images    → Cloudinary (free tier → Pro at scale)

Domain    → Cloudflare (DNS + DDoS + edge caching)
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: cd backend && npm ci
      - run: cd backend && npm test # Jest unit + integration tests
      - run: cd frontend && npm ci
      - run: cd frontend && npm run build # Verify build doesn't break

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd backend && npm run lint # ESLint + TypeScript type check
      - run: cd frontend && npm run lint

  deploy-backend:
    needs: [test, lint]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: railway/deploy@v1 # Railway CLI deploy
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    needs: [test, lint]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"
```

### Environment Configuration

```bash
# backend/.env.example
NODE_ENV=development
PORT=9000

# Database
DATABASE_URL=mysql://root:root@localhost:3306/event_booking_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=at-least-64-random-characters-here
JWT_REFRESH_SECRET=different-64-random-characters-here
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:9000/api/v1/auth/google/callback

# Payment
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Email
SENDGRID_API_KEY=
EMAIL_FROM=noreply@eventbooking.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Meilisearch
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_MASTER_KEY=

# Frontend
FRONTEND_URL=http://localhost:5173

# Sentry
SENTRY_DSN=

# Misc
COOKIE_SECRET=32-random-chars
QR_HMAC_SECRET=32-random-chars
```

---

## 19. Monitoring & Observability

### Three Pillars

**1. Logs (Pino)**

```javascript
// utils/logger.ts
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty" } // Human readable in dev
      : undefined, // Raw JSON in production (parsed by log aggregator)
  base: {
    service: "event-booking-api",
    version: process.env.npm_package_version,
  },
  redact: ["req.headers.authorization", "body.password", "body.card_number"],
});

// Log every request:
// {"level":30,"time":1720000000,"service":"event-booking-api",
//  "req":{"method":"POST","url":"/api/v1/bookings","ip":"1.2.3.4"},
//  "res":{"statusCode":201},"responseTime":45}
```

**2. Errors (Sentry)**

```javascript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of requests traced in production

  // Don't capture expected client errors:
  ignoreErrors: ["AppError"],

  beforeSend(event) {
    // Strip PII from error reports
    delete event.request?.cookies;
    return event;
  },
});
```

**3. Metrics (Prometheus + Grafana)**

```javascript
// Custom metrics to track:
const bookingDuration = new Histogram({
  name: "booking_duration_seconds",
  help: "Time to complete a booking",
  buckets: [0.1, 0.5, 1, 2, 5],
});

const activeConnections = new Gauge({
  name: "ws_active_connections",
  help: "Active WebSocket connections",
});

const queueDepth = new Gauge({
  name: "queue_depth",
  help: "Jobs waiting in queue",
  labelNames: ["queue_name"],
});
```

### Alerts to Configure

| Alert                | Condition             | Action          |
| -------------------- | --------------------- | --------------- |
| API error rate       | > 5% of requests 5xx  | PagerDuty/Slack |
| Booking failure rate | > 2% of bookings fail | PagerDuty       |
| DB connection pool   | > 80% utilization     | Scale DB        |
| Queue depth          | > 1000 jobs pending   | Scale workers   |
| P95 response time    | > 2 seconds           | Investigate     |
| Disk usage           | > 80%                 | Expand volume   |

### Health Check Endpoint

```javascript
GET /health
// Response:
{
  "status": "healthy",
  "timestamp": "2025-08-01T10:00:00Z",
  "checks": {
    "database": "healthy",
    "redis": "healthy",
    "meilisearch": "healthy",
    "queue": { "email": 5, "payment": 0 }  // jobs pending
  },
  "uptime": 259200
}
```

---

## 20. Testing Strategy

### Backend Testing Pyramid

**Unit Tests (Jest) — 70% of tests**

```
Test:     Service layer functions in isolation
Mock:     Repository layer, external services
Example:  bookingService.createBooking() — verify seat count logic,
          pricing calculation, error cases
```

**Integration Tests (Jest + Supertest) — 25% of tests**

```
Test:     Full HTTP request through the stack
Use:      Real test database (seeded before each test suite)
Example:  POST /api/v1/bookings → verify DB records created,
          queue jobs enqueued, response shape correct
```

**E2E Tests (Playwright) — 5% of tests**

```
Test:     Critical user journeys in real browser
Example:  Register → Browse events → Book ticket → Payment → Download ticket
```

### Sample Unit Test

```typescript
// bookings.service.test.ts
describe("BookingService.createBooking", () => {
  it("should throw BOOKING_SEATS_UNAVAILABLE when seats are 0", async () => {
    mockEventsRepo.findById.mockResolvedValue({ available_seats: 0 });

    await expect(
      bookingService.createBooking({ eventId: "123", quantity: 1 }),
    ).rejects.toThrow("BOOKING_SEATS_UNAVAILABLE");
  });

  it("should decrement seats after successful booking", async () => {
    mockEventsRepo.findById.mockResolvedValue({ available_seats: 10 });
    mockBookingsRepo.create.mockResolvedValue({ id: "booking-123" });

    await bookingService.createBooking({ eventId: "123", quantity: 3 });

    expect(mockEventsRepo.decrementSeats).toHaveBeenCalledWith("123", 3);
  });
});
```

### Frontend Testing

```
React Testing Library: Component behavior tests
  - EventCard renders correct data
  - BookingForm validates and submits
  - AuthContext provides correct isAdmin() result
  - PrivateRoute redirects unauthenticated users

MSW (Mock Service Worker): API mocking in tests
  - Intercepts fetch/axios calls
  - Returns controlled responses
  - Tests don't hit real API

Vitest: Faster test runner for Vite projects (replaces Jest on frontend)
```

---

## 21. Code Quality Standards

### SOLID Principles Applied

```
Single Responsibility:  Each module does one thing.
  EventsService only contains event business logic.
  EmailService only sends emails.
  Never mix payment logic into booking controller.

Open/Closed:
  AppError class is extended for specific error types.
  New payment providers implement IPaymentProvider interface.

Liskov Substitution:
  RazorpayService and StripeService both implement IPaymentGateway.
  PaymentService is injected with either — same behavior expected.

Interface Segregation:
  IEventRepository only has event methods.
  Not one massive IRepository with every method for every table.

Dependency Inversion:
  Controllers depend on service interfaces, not concrete classes.
  Services depend on repository interfaces, not Prisma directly.
```

### TypeScript Strictness

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### ESLint Config

```javascript
// .eslintrc
rules: {
  'no-console': 'error',          // Use logger, not console.log
  '@typescript-eslint/no-explicit-any': 'error',
  'import/no-cycle': 'error',     // Prevent circular imports
  'no-floating-promises': 'error' // All promises must be awaited
}
```

---

## 22. Sample Code — Key Modules

### AppError (Central Error Class)

```typescript
// utils/AppError.ts
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly statusCode: number,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

// Usage:
throw new AppError(
  "BOOKING_SEATS_UNAVAILABLE",
  409,
  `Only ${event.available_seats} seats available.`,
  { available: event.available_seats, requested: quantity },
);
```

### Global Error Handler Middleware

```typescript
// middleware/errorHandler.ts
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  logger.error({ err, req: { method: req.method, url: req.url } });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
  }

  // Never leak stack traces in production
  if (process.env.NODE_ENV === "production") {
    Sentry.captureException(err);
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred.",
      },
    });
  }

  return res.status(500).json({
    success: false,
    error: { code: "INTERNAL_ERROR", message: err.message, stack: err.stack },
  });
};
```

### Zod Validation Middleware

```typescript
// middleware/validate.ts
import { ZodSchema } from "zod";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      throw new AppError(
        "VALIDATION_ERROR",
        422,
        "Request validation failed.",
        { fields: result.error.flatten().fieldErrors },
      );
    }

    req.body = result.data.body;
    req.query = result.data.query as ParsedQs;
    next();
  };
};

// bookings.validator.ts
export const createBookingSchema = z.object({
  body: z.object({
    eventId: z.string().uuid(),
    items: z
      .array(
        z.object({
          ticketCategoryId: z.string().uuid(),
          quantity: z.number().int().min(1).max(10),
        }),
      )
      .min(1),
    bookerName: z.string().trim().min(2).max(100),
    bookerEmail: z.string().trim().email(),
    bookerPhone: z
      .string()
      .trim()
      .regex(/^\+?[1-9]\d{9,14}$/),
  }),
});
```

### Booking Service (Transactional with Redis Lock)

```typescript
// bookings.service.ts
async createBooking(data: CreateBookingDto, userId?: string): Promise<BookingResult> {
  // Redis distributed lock prevents double-booking under high load
  const lockKey = `lock:booking:${data.eventId}`;
  const lockTtl = 10; // seconds
  const acquired = await redis.set(lockKey, '1', 'EX', lockTtl, 'NX');

  if (!acquired) {
    throw new AppError('BOOKING_IN_PROGRESS', 429,
      'Another booking is being processed. Please try again.');
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // Lock the event row during transaction
      const event = await tx.$queryRaw<Event[]>`
        SELECT * FROM events WHERE id = ${data.eventId} FOR UPDATE
      `;

      if (!event[0]) throw new AppError('NOT_FOUND', 404, 'Event not found.');
      if (event[0].status !== 'published') {
        throw new AppError('BOOKING_UNAVAILABLE', 409, 'This event is not accepting bookings.');
      }

      // Validate each ticket category
      let subtotal = 0;
      for (const item of data.items) {
        const category = await tx.$queryRaw<TicketCategory[]>`
          SELECT * FROM ticket_categories WHERE id = ${item.ticketCategoryId} FOR UPDATE
        `;
        if (category[0].available_quantity < item.quantity) {
          throw new AppError('BOOKING_SEATS_UNAVAILABLE', 409,
            `Only ${category[0].available_quantity} seats available for ${category[0].name}.`,
            { available: category[0].available_quantity, requested: item.quantity }
          );
        }
        subtotal += category[0].price * item.quantity;
      }

      const platformFee = Math.round(subtotal * 0.02 * 100) / 100; // 2% fee
      const totalAmount = subtotal + platformFee;

      // Create booking record
      const booking = await tx.booking.create({
        data: {
          booking_ref: generateBookingRef(),
          user_id: userId ?? null,
          event_id: data.eventId,
          booker_name: data.bookerName,
          booker_email: data.bookerEmail,
          booker_phone: data.bookerPhone,
          subtotal,
          platform_fee: platformFee,
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'unpaid',
          items: { create: data.items.map(item => ({ ...item, unit_price: ..., subtotal: ... })) }
        }
      });

      // Decrement seat counts
      for (const item of data.items) {
        await tx.$executeRaw`
          UPDATE ticket_categories
          SET available_quantity = available_quantity - ${item.quantity}
          WHERE id = ${item.ticketCategoryId}
        `;
      }

      await tx.$executeRaw`
        UPDATE events
        SET available_seats = available_seats - ${totalQuantity}
        WHERE id = ${data.eventId}
      `;

      return booking;
    });
  } finally {
    await redis.del(lockKey);
  }
}
```

### React Query + Zustand Integration

```typescript
// features/bookings/useBookings.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingService } from "@/services/bookings.service";
import { useAuthStore } from "@/store/authStore";

export const useMyBookings = () => {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ["bookings", "my", user?.id],
    queryFn: () => bookingService.getMyBookings(),
    enabled: !!user,
    staleTime: 60_000, // don't refetch if data < 1 min old
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => bookingService.cancelBooking(bookingId),
    onSuccess: () => {
      // Invalidate and refetch bookings list
      queryClient.invalidateQueries({ queryKey: ["bookings", "my"] });
    },
    onError: (err: ApiError) => {
      toast.error(err.error.message);
    },
  });
};
```

### Zustand Auth Store

```typescript
// store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  accessToken: string | null; // in memory only (security)
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  isAdmin: () => boolean;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      clearAuth: () => set({ user: null, accessToken: null }),
      isAdmin: () => get().user?.role === "admin",
      isAuthenticated: () => !!get().user,
    }),
    {
      name: "auth-storage",
      // Only persist user object — NOT the access token
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
```

### Recharts Revenue Dashboard

```tsx
// features/admin/RevenueChart.tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";

export const RevenueChart = () => {
  const { data } = useQuery({
    queryKey: ["admin", "analytics", "revenue"],
    queryFn: () => adminService.getRevenueByMonth(),
  });

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-border">
      <h3 className="text-lg font-semibold text-text-primary mb-6">
        Monthly Revenue
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value: number) => [
              `₹${value.toLocaleString()}`,
              "Revenue",
            ]}
            contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#6366f1"
            strokeWidth={2.5}
            dot={{ fill: "#6366f1", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
```

---

## 23. Migration Plan from Current System

### Phase 0 — Preparation (1 week)

- [ ] Set up Docker Compose local environment
- [ ] Add TypeScript to existing backend (`tsc --init`)
- [ ] Install and configure Prisma, point at existing MySQL
- [ ] Run `prisma db pull` to introspect existing schema
- [ ] Write Prisma migration to add new tables (UUID columns, new tables)
- [ ] Set up Sentry, configure existing error handler to send to Sentry

### Phase 1 — Security & Auth hardening (1 week)

- [ ] Add Zod validation to all existing routes
- [ ] Add helmet, hpp, rate limiting middleware
- [ ] Implement refresh token system (new table + new endpoints)
- [ ] Move existing polling to remain until WebSockets are ready
- [ ] Add pino structured logging, remove all `console.log`

### Phase 2 — Payment & Ticketing (2 weeks)

- [ ] Add Razorpay integration
- [ ] Create `payments`, `booking_items`, `tickets` tables
- [ ] Implement payment webhook handler
- [ ] Add BullMQ, implement EmailWorker
- [ ] Integrate Nodemailer + SendGrid, add booking confirmation email
- [ ] Implement QR code generation

### Phase 3 — Real-time & Search (1 week)

- [ ] Add Socket.io + Redis adapter
- [ ] Emit seat update events from booking service
- [ ] Replace frontend polling with WebSocket hook
- [ ] Set up Meilisearch, implement event indexing
- [ ] Add search endpoint and frontend search bar

### Phase 4 — Frontend upgrade (2 weeks)

- [ ] Add React Query, migrate all `useEffect` + `fetch` calls
- [ ] Add Zustand, migrate AuthContext to authStore
- [ ] Add admin Recharts analytics dashboard
- [ ] Implement ticket download page with QR display
- [ ] Add My Bookings page with cancel + PDF download

### Phase 5 — DevOps (1 week)

- [ ] Add Dockerfile for backend
- [ ] Add GitHub Actions CI/CD pipeline
- [ ] Deploy to Railway (backend) + Vercel (frontend)
- [ ] Set up Prometheus + Grafana on monitoring instance
- [ ] Configure alert rules (error rate, response time)

### Phase 6 — Polish & Scale (ongoing)

- [ ] Reviews and ratings system
- [ ] Wishlist feature
- [ ] CSV export for admin
- [ ] Google OAuth
- [ ] Organizer role and dashboard
- [ ] Load test with k6 targeting 10k concurrent users
- [ ] Add MySQL read replica, route reads through it

---

_This document defines the complete production architecture for EventBooking v2.0._  
_It serves as the authoritative design reference for all engineering decisions._  
_Last updated: March 2026._
