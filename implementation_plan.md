# Scan My Record — Implementation Plan

> **One Scan. Four Years of Impact.**
> A digital impact and community engagement platform for politicians and public office holders.

## Overview

**Scan My Record** is a production-quality civic-tech platform that connects physical campaign materials (billboards, posters, QR codes) to a digital public accountability record. The public can scan a QR code to instantly access a politician's four-year record without needing an account.

**Stack**: Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · MongoDB · Mongoose · Argon2 · Paystack · Cloudflare R2/Cloudinary · BullMQ (optional) · Redis (optional)

> [!IMPORTANT]
> This project uses **Next.js 16.3.5** with **React 19** and **Tailwind CSS v4**. This is NOT the same as Next.js 14/15. Key differences:
> - Caching uses the new `use cache` directive with `cacheLife()` — not `fetch()` cache options
> - Server Actions are standard React Server Functions with `'use server'` directive
> - Tailwind CSS v4 config is done via CSS, not `tailwind.config.js`
> - `@tailwindcss/postcss` is used instead of `tailwindcss` as a PostCSS plugin

---

## Open Questions

> [!IMPORTANT]
> **Payment Provider**: The PRD mentions Paystack or Flutterwave. Which should we integrate first? *(Recommendation: Paystack — widely used in Nigeria, excellent API)*

> [!IMPORTANT]
> **Media Storage**: Cloudflare R2 or Cloudinary? *(Recommendation: Cloudinary — easiest integration, has free tier for MVP, image transformations built-in)*

> [!IMPORTANT]
> **Redis/BullMQ**: Should we include these in the MVP or defer? *(Recommendation: Defer — implement analytics as lightweight async counters first; add Redis/BullMQ in Phase 6+)*

> [!IMPORTANT]
> **Multi-politician vs Single**: Is the MVP for a single politician instance or a true multi-tenant platform? *(Recommendation: Build multi-politician from day one — the routing `[politicianSlug]` already implies it)*

---

## Proposed Changes

---

### Phase 1 — Foundation: Project Setup, Design System, Database & Auth

**Goal**: Solid base. Working auth. MongoDB connected. Design tokens established. Seed data ready.

---

#### [MODIFY] [package.json](file:///c:/Users/HomePC/Desktop/MASTERS/scanmyrecord/package.json)

Install all required dependencies:

**Runtime dependencies**:
```
mongoose              # MongoDB ODM
argon2                # Password hashing
jose                  # JWT / session tokens (HTTP-only cookies)
zod                   # Validation
nanoid                # Short unique IDs (QR codes, references)
qrcode                # QR code generation
react-hook-form       # Form management
@hookform/resolvers   # Zod + RHF integration
framer-motion         # Animations
recharts              # Admin analytics charts
lucide-react          # Icons
clsx                  # Conditional classnames
tailwind-merge        # Tailwind class merging
date-fns              # Date formatting
next-themes           # Theme support
sonner                # Toast notifications
@radix-ui/*           # shadcn/ui primitives
```

**Dev dependencies**:
```
@types/qrcode
vitest                # Testing
@vitejs/plugin-react  # Testing
```

---

#### [NEW] `.env.local`

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_SECRET=<random-256-bit-secret>

# MongoDB
MONGODB_URI=mongodb://localhost:27017/scanmyrecord

# Auth
SESSION_SECRET=<random-256-bit-secret>
SESSION_MAX_AGE=86400

# Media (Cloudinary)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Payments (Paystack)
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=

# Redis (optional, defer for MVP)
# REDIS_URL=
```

---

#### [NEW] `src/lib/db/connection.ts`

MongoDB singleton connection using Mongoose. Caches connection across hot-reloads in development.

```ts
// Pattern:
let cached = global.mongoose
if (!cached) { cached = global.mongoose = { conn: null, promise: null } }
```

---

#### [NEW] `src/models/` — All Mongoose Models

| File | Description |
|------|-------------|
| `User.ts` | Admin users. Roles: ADMIN, SUPER_ADMIN. Hashed password. |
| `Politician.ts` | Core politician profile. Slug-indexed. |
| `Project.ts` | Projects with status, category, images, coordinates. |
| `Programme.ts` | Community programmes. Custom fields config. |
| `ProgrammeField.ts` | Dynamic field definitions for programme registration forms. |
| `Registration.ts` | Public programme registrations. Unique ref `SMR-YYYY-NNNNNN`. |
| `Distribution.ts` | Programme beneficiary distribution records. |
| `FundraisingCampaign.ts` | Fundraising campaigns with target/raised amounts. |
| `Donation.ts` | Individual donations. Unique ref `SMR-DON-YYYY-NNNNNN`. |
| `QRCode.ts` | Short-code QR records. |
| `QRScan.ts` | Scan events (timestamp, qrCodeId, anonymized). |
| `AuditLog.ts` | Admin action audit trail. |

**Key indexes** (as specified in PRD §34):
```
Politician: slug (unique)
Project: slug (unique), status, category, year, politicianId
Programme: slug (unique), status, politicianId
FundraisingCampaign: slug (unique), status, politicianId
QRCode: code (unique), status
QRScan: qrCodeId, createdAt
Registration: reference (unique), programmeId, status, email+programmeId (compound unique)
Donation: reference (unique), campaignId, status, paymentReference (unique sparse)
```

---

#### [NEW] `src/lib/auth/` — Authentication Layer

| File | Purpose |
|------|---------|
| `session.ts` | Create/verify HTTP-only cookie sessions using `jose` |
| `password.ts` | `hashPassword()` / `verifyPassword()` using `argon2` |
| `middleware.ts` | Route protection middleware |
| `rbac.ts` | Role-based authorization helpers |

Session stored in HTTP-only, `Secure`, `SameSite=Strict` cookie. No JWT exposed to client.

---

#### [NEW] `src/lib/validation/` — Zod Schemas

One schema file per domain:
```
auth.schema.ts
politician.schema.ts
project.schema.ts
programme.schema.ts
registration.schema.ts
fundraising.schema.ts
donation.schema.ts
qr.schema.ts
```

---

#### [NEW] `src/app/globals.css` — Design System (Tailwind v4)

Tailwind v4 uses CSS-native configuration. Define design tokens here:

```css
@import "tailwindcss";

@theme {
  /* Typography */
  --font-sans: 'Plus Jakarta Sans', 'Inter', sans-serif;
  
  /* Primary palette */
  --color-navy-950: #0a0f1e;
  --color-navy-900: #0f1729;
  --color-navy-800: #1a2540;
  --color-navy-700: #243052;
  
  /* Neutral */
  --color-slate-50: #f8fafc;
  /* ... */
  
  /* Status colors */
  --color-completed: #16a34a;    /* green-600 */
  --color-ongoing: #d97706;      /* amber-600 */
  --color-proposed: #4f46e5;     /* indigo-600 */
}
```

---

#### [NEW] `src/lib/db/seed.ts` — Seed Script

Realistic Nigerian seed data:
- 1 Politician: **Hon. Adeyemi Okafor**, Member House of Representatives, Lagos Constituency II, 2022–2026
- 10 Projects (5 completed, 3 ongoing, 2 proposed) across categories: Healthcare, Roads, Education, Water, Youth
- 4 Programmes: Education Support, Medical Outreach, Youth Empowerment, Skills Training
- 2 Fundraising Campaigns
- 4 QR Codes (politician, project, programme, fundraising)
- 1 Super Admin user

---

### Phase 2 — Public: Politician Profile, Projects & Timeline

**Goal**: The core public-facing experience. A person scans a QR code and immediately sees the full accountability record.

---

#### [NEW] `src/app/(public)/layout.tsx`

Shared layout for all public pages. Clean, no admin chrome.

---

#### [NEW] `src/app/(public)/[politicianSlug]/page.tsx` — Politician Landing Page

Server Component. Fetches politician, projects (aggregated stats), programmes, and fundraising campaigns.

Sections:
1. **Sticky public nav** — About · Projects · Timeline · Programmes · Fundraising
2. **Hero** — Photo, name, position, constituency, service period, tagline, CTAs
3. **Impact Stats** — Dynamic counters: projects delivered, ongoing, communities, years
4. **Four-Year Record** — Preview cards for completed / ongoing / proposed
5. **Timeline** — Interactive year-by-year project listing
6. **Community Programmes** — Programme cards
7. **Fundraising** — Campaign cards with progress bars
8. **Footer** — Social links, share buttons

Uses `'use cache'` with `cacheLife('hours')` for politician profile data.

---

#### [NEW] `src/app/(public)/[politicianSlug]/projects/page.tsx` — Project List

Filtering UI (status, category, year), search, paginated project grid, skeleton loaders, empty states.

---

#### [NEW] `src/app/(public)/[politicianSlug]/projects/[projectSlug]/page.tsx` — Project Detail

Dynamic OG metadata. Image gallery (swipeable on mobile). Video section. Location. Sharing buttons (WhatsApp, Facebook, X, Copy).

---

#### [NEW] `src/components/public/` — Public Components

| Component | Purpose |
|-----------|---------|
| `PoliticianHero.tsx` | Hero with photo, name, CTAs |
| `ImpactStats.tsx` | Animated counter section |
| `PublicNav.tsx` | Sticky nav with mobile compact mode |
| `ProjectCard.tsx` | Project card with status badge |
| `ProjectGrid.tsx` | Responsive grid with filters |
| `ProjectStatusBadge.tsx` | ✓ COMPLETED / ◐ ONGOING / ○ PROPOSED |
| `ProjectGallery.tsx` | Desktop grid + mobile swipe gallery |
| `Timeline.tsx` | Year-grouped interactive timeline |
| `ShareButtons.tsx` | WhatsApp, Facebook, X, Copy + Web Share API |
| `ProgressBar.tsx` | Fundraising progress indicator |
| `FundraisingCard.tsx` | Campaign card with progress |
| `ProgrammeCard.tsx` | Programme card |

---

#### [NEW] API Routes — Public Read

```
GET /api/politicians/[slug]/route.ts
GET /api/politicians/[slug]/projects/route.ts    (with filter/pagination)
GET /api/politicians/[slug]/programmes/route.ts
GET /api/politicians/[slug]/fundraising/route.ts
GET /api/projects/[slug]/route.ts
GET /api/programmes/[slug]/route.ts
GET /api/fundraising/[slug]/route.ts
```

---

### Phase 3 — Programmes & Dynamic Registration

**Goal**: Public programme listing, detail, and registration flow with dynamic custom fields.

---

#### [NEW] `src/app/(public)/[politicianSlug]/programmes/page.tsx`

Programme listing. Status-aware (open/closed). Empty state.

---

#### [NEW] `src/app/(public)/[politicianSlug]/programmes/[programmeSlug]/page.tsx`

Programme detail with registration form or "Registration Closed" state.

---

#### [NEW] `src/app/(public)/[politicianSlug]/programmes/[programmeSlug]/register/page.tsx`

Dynamic registration form:
- Base fields: Full Name, Phone, Email, Address, State, LGA
- Custom fields rendered from `ProgrammeField` config
- Zod validation
- Capacity check before submission
- Date window check

---

#### [NEW] `src/app/(public)/[politicianSlug]/programmes/[programmeSlug]/register/confirmation/page.tsx`

Beautiful confirmation page showing reference `SMR-2026-001248`.

---

#### [NEW] `src/services/registration.service.ts`

```ts
// Business logic:
createRegistration()    // validate capacity, date window, duplicate check, generate reference
getRegistration()
updateRegistrationStatus()
```

Reference format: `SMR-YYYY-NNNNNN` (sequential padded per year).
Duplicate prevention: compound unique index on `(programmeId, phone)` OR `(programmeId, email)`.

---

#### [NEW] API Routes — Programmes

```
POST /api/programmes/[id]/register/route.ts   (public)
GET  /api/registrations/[reference]/route.ts  (status lookup)
```

---

### Phase 4 — Fundraising & Payment

**Goal**: Full donation flow with Paystack integration and secure webhook verification.

---

#### [NEW] `src/lib/payments/` — Payment Abstraction

```
payments/
  interface.ts          # IPaymentProvider interface
  paystack/
    provider.ts         # Paystack implementation
    webhook.ts          # Signature verification
  factory.ts            # Returns configured provider
```

`IPaymentProvider` interface:
```ts
interface IPaymentProvider {
  initializePayment(params: InitializePaymentParams): Promise<PaymentInitResult>
  verifyPayment(reference: string): Promise<PaymentVerifyResult>
  handleWebhook(payload: unknown, signature: string): Promise<WebhookResult>
}
```

---

#### [NEW] `src/app/(public)/[politicianSlug]/fundraising/[campaignSlug]/page.tsx`

Campaign detail with progress bar, video, CTAs, disclosures, terms.

---

#### [NEW] `src/app/(public)/[politicianSlug]/fundraising/[campaignSlug]/contribute/page.tsx`

Contribution flow:
1. Amount selector (preset amounts + custom input)
2. Donor info (name, email, phone — anonymous option)
3. Initialize payment → redirect to Paystack hosted page
4. Return URL: `/contribute/verify?ref=...`

---

#### [NEW] `src/app/(public)/[politicianSlug]/fundraising/[campaignSlug]/contribute/verify/page.tsx`

Polls or server-side verifies payment, shows success/failure state.

> [!CAUTION]
> `amountRaised` on FundraisingCampaign is ONLY updated after backend verifies payment — never on initialization or client signal.

---

#### [NEW] `src/app/api/webhooks/payment/route.ts`

Webhook handler (idempotent):
1. Verify Paystack signature (HMAC-SHA512)
2. Find donation by `paymentReference`
3. Check `donation.status !== 'SUCCESSFUL'` (idempotency guard)
4. Mark donation `SUCCESSFUL`
5. Atomic `$inc` on `FundraisingCampaign.amountRaised`
6. Write audit log
7. Return 200

---

#### [NEW] `src/services/fundraising.service.ts`

```ts
createDonation()           // init, generate reference SMR-DON-YYYY-NNNNNN
verifyAndCompleteDonation() // idempotent
getFundraisingStats()
```

---

### Phase 5 — QR Code System

**Goal**: Full QR generation, redirect, and scan tracking.

---

#### [NEW] `src/lib/qr/` — QR Library

```
qr/
  generate.ts    # Generate QR image (PNG/SVG) using 'qrcode' package
  codes.ts       # Short code generation using nanoid (8-12 chars, URL-safe)
```

---

#### [NEW] `src/app/q/[code]/route.ts` — QR Redirect Handler

This is a Route Handler (not a page) for maximum speed:

```ts
export async function GET(request, { params }) {
  const qr = await QRCode.findOne({ code: params.code })
  if (!qr || qr.status === 'DISABLED') {
    redirect('/qr/invalid')
  }
  // Record scan asynchronously (non-blocking)
  recordScanAsync(qr._id)
  redirect(qr.targetUrl)
}
```

---

#### [NEW] `src/app/q/invalid/page.tsx`

Friendly error page for disabled/invalid QR codes.

---

#### [NEW] `src/services/qr.service.ts`

```ts
createQRCode()         // generate short code, assign target
resolveQRCode()        // lookup by code
recordScan()           // async, non-blocking
disableQRCode()
getQRAnalytics()
downloadQRAsset()      // returns PNG/SVG buffer
```

---

### Phase 6 — Admin Dashboard

**Goal**: Full admin interface. SaaS-quality dashboard. All CRUD operations. Analytics.

---

#### [NEW] `src/app/admin/login/page.tsx`

Login form. Rate-limited. Sets HTTP-only session cookie on success.

---

#### [NEW] `src/app/admin/layout.tsx`

Admin shell layout with:
- Desktop: fixed sidebar + main content
- Mobile: header + drawer navigation

---

#### [NEW] Admin Pages

| Route | Purpose |
|-------|---------|
| `/admin/dashboard` | KPI cards, recent activity, trends |
| `/admin/profile` | Politician profile editor (photo, bio, social links) |
| `/admin/projects` | Project table with search/filter, create/edit/archive |
| `/admin/projects/new` | Project creation form |
| `/admin/projects/[id]/edit` | Project edit form |
| `/admin/programmes` | Programme table, publish/unpublish |
| `/admin/programmes/new` | Programme form + field builder |
| `/admin/programmes/[id]/registrations` | Registration management table |
| `/admin/fundraising` | Campaign table |
| `/admin/fundraising/new` | Campaign creation form |
| `/admin/fundraising/[id]/donations` | Donation records |
| `/admin/qr-codes` | QR management table + download |
| `/admin/analytics` | Charts: scans, views, registrations, donations |
| `/admin/administrators` | Admin user management (SUPER_ADMIN only) |

---

#### [NEW] `src/components/admin/` — Admin Components

| Component | Purpose |
|-----------|---------|
| `AdminSidebar.tsx` | Navigation with active states |
| `AdminHeader.tsx` | Page header with breadcrumbs |
| `StatCard.tsx` | KPI card with trend indicator |
| `DataTable.tsx` | Generic sortable/filterable table |
| `ProjectForm.tsx` | React Hook Form + Zod project editor |
| `ProgrammeForm.tsx` | Programme editor |
| `ProgrammeFieldBuilder.tsx` | Visual drag-and-drop custom field builder |
| `FundraisingForm.tsx` | Campaign editor |
| `ImageUploader.tsx` | Drag-drop upload with preview |
| `QRCodeTable.tsx` | QR management with download |
| `AnalyticsCharts.tsx` | Recharts-based charts |
| `RegistrationTable.tsx` | Registration CRUD with bulk actions |
| `DonationTable.tsx` | Donation records view |

---

#### [NEW] Admin API Routes (Protected)

All protected by session middleware + RBAC.

```
POST   /api/admin/auth/login
POST   /api/admin/auth/logout
GET    /api/admin/auth/me

GET    /api/admin/politician/route.ts
PATCH  /api/admin/politician/route.ts

POST   /api/admin/projects/route.ts
GET    /api/admin/projects/route.ts
PATCH  /api/admin/projects/[id]/route.ts
DELETE /api/admin/projects/[id]/route.ts  (soft delete/archive)

POST   /api/admin/programmes/route.ts
PATCH  /api/admin/programmes/[id]/route.ts
PATCH  /api/admin/registrations/[id]/status/route.ts

POST   /api/admin/fundraising/route.ts
PATCH  /api/admin/fundraising/[id]/route.ts

POST   /api/admin/qr-codes/route.ts
PATCH  /api/admin/qr-codes/[id]/disable/route.ts
GET    /api/admin/qr-codes/[id]/download/route.ts

GET    /api/admin/analytics/route.ts

POST   /api/admin/media/upload/route.ts  (Cloudinary upload)

POST   /api/admin/administrators/route.ts  (SUPER_ADMIN only)
```

---

#### [NEW] `src/middleware.ts` — Next.js Middleware

Protects all `/admin/*` routes (except `/admin/login`). Redirects to login if no valid session. Checks role for SUPER_ADMIN-only routes.

---

### Phase 7 — Analytics, Performance, Security & Polish

**Goal**: Production-ready. Fast. Secure. Accessible.

---

#### [MODIFY] Analytics Architecture

Lightweight async scan tracking:
```
Request → QR redirect → non-blocking recordScan() → DB write
```

Page view tracking via lightweight Server Component calls (no client JS needed for core analytics).

QR analytics aggregated daily by a lightweight cron or on-demand aggregation.

---

#### [NEW] `src/app/sitemap.ts` — Dynamic Sitemap

Generates sitemap entries for all public politician/project/programme/fundraising pages.

---

#### [NEW] `src/app/robots.ts`

Allows public pages, disallows `/admin/`.

---

#### SEO — Dynamic Metadata

Each public page implements `generateMetadata()`:
```ts
export async function generateMetadata({ params }) {
  const politician = await getPolitician(params.politicianSlug)
  return {
    title: `${politician.name} — Scan My Record`,
    description: politician.biography.substring(0, 160),
    openGraph: { ... },
    twitter: { ... },
  }
}
```

---

#### Performance Optimizations

- Server Components for all public read-heavy pages
- `'use cache'` + `cacheLife('hours')` on politician profile, project listings
- `revalidateTag()` called by admin when content is updated
- `next/image` with proper `sizes` for responsive images
- Skeleton loaders for all async boundaries (`loading.tsx` files)
- Streaming with `<Suspense>` for below-fold sections

---

#### Security Hardening

- Argon2id password hashing (memory: 64MB, iterations: 3)
- HTTP-only, Secure, SameSite=Strict session cookies
- CSRF: Server Actions have built-in CSRF protection; Route Handlers use `Origin` header checks
- Rate limiting on: `/admin/login`, `/api/programmes/*/register`, `/api/donations`, `/q/*`
- Zod validation on ALL server-side inputs
- MongoDB query sanitization (Mongoose handles prototype injection)
- File upload validation: type whitelist (jpg, png, webp, mp4), size limits
- Webhook signature verification before any processing
- `amountRaised` only updated via atomic `$inc` in webhook handler
- Audit logs for all sensitive admin actions

---

#### Accessibility

- Semantic HTML throughout
- ARIA labels on interactive elements
- Keyboard navigation
- Focus visible states
- Status never communicated by color alone (✓ ◐ ○ icons + labels)
- `alt` text on all images
- Form error messages linked via `aria-describedby`

---

## File / Directory Structure

```
scanmyrecord/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   └── [politicianSlug]/
│   │   │       ├── page.tsx                    # Landing page
│   │   │       ├── projects/
│   │   │       │   ├── page.tsx
│   │   │       │   └── [projectSlug]/page.tsx
│   │   │       ├── programmes/
│   │   │       │   ├── page.tsx
│   │   │       │   └── [programmeSlug]/
│   │   │       │       ├── page.tsx
│   │   │       │       ├── register/page.tsx
│   │   │       │       └── register/confirmation/page.tsx
│   │   │       └── fundraising/
│   │   │           ├── page.tsx
│   │   │           └── [campaignSlug]/
│   │   │               ├── page.tsx
│   │   │               └── contribute/
│   │   │                   ├── page.tsx
│   │   │                   └── verify/page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── projects/...
│   │   │   ├── programmes/...
│   │   │   ├── fundraising/...
│   │   │   ├── qr-codes/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   └── administrators/page.tsx
│   │   ├── api/
│   │   │   ├── politicians/[slug]/route.ts
│   │   │   ├── projects/...
│   │   │   ├── programmes/...
│   │   │   ├── fundraising/...
│   │   │   ├── donations/route.ts
│   │   │   ├── admin/...
│   │   │   └── webhooks/payment/route.ts
│   │   ├── q/
│   │   │   ├── [code]/route.ts              # QR redirect (Route Handler)
│   │   │   └── invalid/page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── components/
│   │   ├── ui/                              # shadcn/ui components
│   │   ├── public/
│   │   └── admin/
│   ├── lib/
│   │   ├── auth/
│   │   ├── db/
│   │   ├── payments/
│   │   ├── qr/
│   │   ├── storage/
│   │   ├── analytics/
│   │   ├── cache/
│   │   └── validation/
│   ├── models/
│   ├── services/
│   ├── types/
│   ├── hooks/
│   └── utils/
├── middleware.ts
├── next.config.ts
├── .env.local
└── package.json
```

---

## Verification Plan

### Automated Tests (Vitest)

```bash
npx vitest run
```

Test suites:
- `auth.test.ts` — login valid/invalid, protected routes
- `projects.test.ts` — CRUD, public retrieval, status
- `registration.test.ts` — create, duplicate prevention, capacity, date window
- `fundraising.test.ts` — donation create, webhook verification, idempotency, amount update
- `qr.test.ts` — code resolution, disabled QR, scan recording

### Manual Verification Checklist

- [ ] All public routes render without error
- [ ] Mobile layout correct at 375px (Chrome DevTools)
- [ ] Admin login works and sets HTTP-only cookie
- [ ] Admin routes redirect to login when unauthenticated
- [ ] SUPER_ADMIN routes blocked for ADMIN role
- [ ] MongoDB indexes present (run `db.collection.getIndexes()`)
- [ ] Payment webhook idempotency (send duplicate webhook, verify `amountRaised` unchanged)
- [ ] QR redirect works for all types (politician, project, programme, fundraising)
- [ ] Disabled QR codes redirect to `/q/invalid`
- [ ] Programme registration respects capacity and date window
- [ ] Duplicate registration prevented
- [ ] Reference numbers generated correctly (`SMR-2026-001248`, `SMR-DON-2026-000839`)
- [ ] Analytics update after scan
- [ ] SEO metadata present on public pages
- [ ] OG image tags correct
- [ ] No sensitive admin data in public API responses
- [ ] All forms show meaningful server-side validation errors
- [ ] Empty states displayed (no projects, no programmes, no fundraising)
- [ ] Sharing works: WhatsApp, Facebook, X, Copy Link
- [ ] Image upload works and stores to Cloudinary
- [ ] QR PNG download works from admin

---

## Phase Summary

| Phase | Focus | Key Deliverables |
|-------|-------|-----------------|
| **1** | Foundation | Setup, design system, DB models, auth, seed data |
| **2** | Public Core | Politician profile, projects, timeline |
| **3** | Programmes | Programme listing, registration flow, capacity/date checks |
| **4** | Fundraising | Donation flow, Paystack integration, webhook |
| **5** | QR System | Code generation, redirects, scan tracking |
| **6** | Admin | Full admin dashboard, CRUD, analytics UI |
| **7** | Polish | Performance, security, a11y, SEO, testing |

---

*Plan prepared for Next.js 16.3.5 · React 19 · Tailwind CSS v4 · September 2026*
