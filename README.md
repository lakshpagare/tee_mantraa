# tee-mantraa — Premium Clothing E-commerce

A complete Next.js (App Router) fashion storefront with customer accounts, cart, checkout (Razorpay + Cash on Delivery),
orders, reviews, coupons, a full admin panel, a homepage CMS and analytics. Visual language is inspired by editorial
fashion sites: large imagery, serif display type, generous whitespace, restrained motion.

> **Status:** this codebase was written without the ability to run `npm install`, `npm run build` or `npm run lint`.
> Expect to fix a handful of type/lint errors on the first build. See [First run checklist](#first-run-checklist).

## What's new (advanced features)

Razorpay **webhook** · transactional **emails** (placed/shipped/delivered/cancelled, returns, back-in-stock, low-stock admin alert, abandoned cart) ·
GST **invoice** (print / save as PDF) · **returns & exchanges** flow · **pincode** delivery/COD check · **size advisor** ·
product **video** · **compare** (up to 3) · **recently viewed** · **complete the look** · customer **photo gallery** in reviews ·
**back-in-stock** alerts · **gift cards** · **loyalty points** + **referral codes** · **journal** (blog) · **lookbook** ·
**live Instagram** grid · **WhatsApp** chat button · **PWA** (installable + offline page) · GA4 / Meta Pixel events ·
**STAFF / ADMIN / SUPER_ADMIN** roles with a Team page · CSV exports (orders, customers) · courier tracking links ·
Redis (Upstash) rate limiting · cached homepage/catalog reads · Playwright smoke tests · custom cursor.

### Setting up the new features

| Feature | What to configure |
|---|---|
| Emails | `RESEND_API_KEY`, `MAIL_FROM` (without a key, emails are logged to the server console) |
| Razorpay webhook | Dashboard → Webhooks → `https://YOUR-DOMAIN/api/payments/webhook`, events `payment.captured`, `order.paid`, `payment.failed`; secret → `RAZORPAY_WEBHOOK_SECRET` |
| UPI / EMI / Pay Later | Enable the methods in the Razorpay Dashboard; Razorpay Checkout then shows them automatically |
| Invoices | Admin → Settings → business name, GSTIN, address, state |
| Pincode check | Admin → Settings → unserviceable PIN codes (ETAs are estimated from the PIN zone; swap in a courier API for exact dates) |
| WhatsApp button | Admin → Settings → WhatsApp number with country code (e.g. `919876543210`) |
| Low-stock alerts | Admin → Settings → Admin alert email (falls back to contact email) |
| Abandoned carts | Set `CRON_SECRET`; `vercel.json` runs `/api/cron/abandoned-carts` daily (Vercel Hobby allows daily crons only) |
| Analytics | `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID` |
| Redis rate limiting | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| Instagram feed | `INSTAGRAM_ACCESS_TOKEN` (long-lived); otherwise the CMS images are used |
| Roles | `npm run seed -- --admin-only` makes your admin a **SUPER_ADMIN**; then use Admin → Team & roles |
| E2E tests | `npm run test:e2e:install` once, then `npm run test:e2e` (needs a seeded database) |

**Loyalty rules** (change in `lib/pricing.ts`): 1 point per ₹100 when an order is delivered; 1 point = ₹1; redeem up to 20% of an order.
Referral: new user gets 50 points; the referrer gets 100 when the friend's first order is delivered.
Gift cards are issued by admins (Admin → Gift cards) — there is no online gift-card purchase flow yet.

### Second round of features

**WhatsApp (two ways):** automatic order messages through the **WhatsApp Business Cloud API** (needs a Meta Business account; customers opt in at checkout) *and* manual one-tap sending from your **personal / Business WhatsApp** on every order (Admin → Orders → open an order).
**Dark mode** (toggle in the header; remembers the choice; admin stays light) · **Sentry** error tracking (inert until a DSN is set) ·
**Offers** (percentage, buy-X-get-Y, bundle price) with automatic best-offer pricing · **Flash sales** with live countdown and reduced prices ·
**Cart upsell** suggestions (also steers toward free shipping) · **Customer order cancel** (until shipped; auto Razorpay refund) ·
**Short wishlist share links** (`/w/abc123`, WhatsApp/native share) · **Admin activity log** · **Profit report** · **Smarter search**
(typo tolerance, synonyms, ranking, "did you mean", suggestions, live trending).

| Feature | Setup |
|---|---|
| WhatsApp Business API | `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` (Meta → WhatsApp → API setup). Test it in Admin → Settings → *Send test*. |
| WhatsApp templates | Meta only delivers free-text within 24h of a customer message. For order updates, create approved templates and set `WHATSAPP_USE_TEMPLATES=true`. Suggested body text — **order_placed**: `Hi {{1}}, thanks for your order {{2}}! Total {{3}}.` · **order_shipped**: `Hi {{1}}, order {{2}} has shipped: {{3}}.` · **order_delivered**: `Hi {{1}}, order {{2}} was delivered.` · **order_cancelled**: `Hi {{1}}, order {{2}} was cancelled.` · **order_returned**: `Hi {{1}}, order {{2}} is marked returned.` (language code in `WHATSAPP_TEMPLATE_LANG`). |
| Personal WhatsApp | Nothing to set up. Buttons on each order open WhatsApp with the message pre-filled using the customer's phone number. |
| Sentry | `NEXT_PUBLIC_SENTRY_DSN` (+ `SENTRY_DSN`); optionally `SENTRY_ORG/PROJECT/AUTH_TOKEN` for source maps. |
| Offers / flash sales | Admin → *Offers & flash sales*. The single best offer applies; coupons stack on top. Flash sales: percentage only, need an end date, scope = all / categories / products. |
| Profit report | Fill **Cost price** on products. Set the gateway fee % in Settings. Needs ADMIN role (hidden from STAFF). |
| Activity log | Automatic. Admin → *Activity log* (ADMIN and above). |

**Search notes:** the index is built from the catalogue and cached ~5 minutes (and refreshed when products change in admin). It's designed for up to a few thousand products; for bigger catalogues swap `searchProducts()` in `lib/search.ts` for Algolia/Meilisearch.
**Cancel & refunds:** customers can cancel in *Pending / Confirmed / Processing*. Paid Razorpay orders are refunded automatically; if that call fails the order timeline tells you to refund from the Razorpay dashboard.

### Not included (needs accounts, assets or a larger refactor)

Variant-wise (size × colour) stock · Shiprocket/Delhivery **API** integration (tracking links are supported) ·
multi-language (Marathi/Hindi) · multi-currency · 360° product view · online gift-card purchase · dark mode in the admin panel.

## Features

**Storefront** — cinematic hero (clip-path reveal, parallax), marquee, editorial category cards (swipe on mobile), product
grids with hover image-swap / quick add / wishlist heart, editorial asymmetric section, GSAP-scrubbed collection banner,
best sellers, promo banner, brand story, testimonials carousel, social grid, newsletter, footer, announcement bar,
transparent-to-solid sticky navbar, animated mobile menu, mobile bottom navigation, Lenis smooth scrolling, page
transitions, scroll progress + back-to-top, `prefers-reduced-motion` support.

**Shopping** — `/shop` with search, category/gender/size/colour/price/rating/availability filters and 6 sort modes (all in
the URL), `/category/[slug]`, `/collections`, product page (gallery with zoom, variants, low-stock notice, accordions,
reviews, related), quick-view modal, animated cart drawer, free-shipping progress, `/cart`, `/checkout`, search overlay
(debounced instant results, recent + trending), wishlist (synced to the account), coupons.

**Accounts** — email/password + Google (Auth.js v5), email verification, password reset, protected routes, account
dashboard (profile, orders with tracking timeline, wishlist, addresses, settings).

**Admin (`/admin`)** — dashboard (Recharts), products CRUD (multi-image upload, drag-to-reorder, colours, sizes, tags),
categories, collections (assign products), orders (status, payment, tracking, timeline), customers (block/unblock),
inventory (stock editing, low/out highlighting), coupons, reviews moderation, banners, testimonials, newsletter,
**homepage CMS** (every section editable, no code), analytics (date ranges), settings (brand name, tagline,
announcement, shipping/tax, socials).

## Tech stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS 3 · Framer Motion · GSAP (ScrollTrigger) · Lenis · Zustand ·
React Hook Form + Zod · MongoDB + Mongoose · Auth.js (next-auth v5 beta) · Cloudinary · Razorpay · Sonner · Recharts ·
Lucide. UI primitives are hand-written (shadcn-style, no Radix dependency).

## Installation

```bash
npm install
cp .env.example .env.local     # then fill in values
npm run images                 # (optional) regenerate SVG placeholder artwork
npm run seed                   # admin user + demo data
npm run dev                    # http://localhost:3000
```

## Environment variables

See `.env.example`. Required: `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_APP_URL`.
Optional: Google (`GOOGLE_CLIENT_ID/SECRET`, `NEXT_PUBLIC_GOOGLE_ENABLED`), Cloudinary, Razorpay, Resend (`RESEND_API_KEY`), `REQUIRE_EMAIL_VERIFICATION`.
Seed: `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` (min 10 chars), `SEED_ADMIN_NAME`.
Generate a secret with `openssl rand -base64 32`. Secret keys are only read on the server; the only `NEXT_PUBLIC_` values
are the app URL and (optionally) the Razorpay **key id**.

## MongoDB setup

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user, and allow your IP (for Vercel: allow `0.0.0.0/0` or use Atlas's Vercel integration).
3. Copy the connection string into `MONGODB_URI` (include the database name, e.g. `/tee-mantraa`).
Local alternative: `mongodb://127.0.0.1:27017/tee-mantraa`.

## Authentication setup

- **Email/password** works out of the box. Passwords are hashed with bcrypt (cost 12). In development the verification and
  reset links are logged to the server console (and shown on screen). In production set `RESEND_API_KEY` + `MAIL_FROM`.
- **Google**: create OAuth credentials in Google Cloud Console → *Authorized redirect URI*:
  `http://localhost:3000/api/auth/callback/google` (and your production URL). Set `GOOGLE_CLIENT_ID/SECRET`.
  Then set `NEXT_PUBLIC_GOOGLE_ENABLED=true` to show the "Continue with Google" button (it is hidden by default).
- Roles: `USER`, `STAFF` (orders, returns, customers, inventory, reviews, dashboard), `ADMIN` (everything except team), `SUPER_ADMIN` (everything). Permissions live in `lib/constants.ts` (`canAccess`).

## Cloudinary setup

Create a Cloudinary account and set `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET`. Uploads (admin + review photos) go to
Cloudinary. Without it, uploads fall back to `/public/uploads` in development only (not persistent on Vercel; production
returns a clear error). Any `https://res.cloudinary.com/...` URL is optimised by `next/image`.

## Razorpay setup

1. Create a Razorpay account and copy **Key ID** and **Key Secret** (test mode first).
2. Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`.
3. Flow: `/api/checkout` validates the cart **server-side** (prices come from the DB), reserves stock, creates the order and a
   Razorpay order → Checkout opens → `/api/payments/verify` checks the HMAC signature with the secret → stock is committed.
   Abandoned unpaid orders release their reservation after 30 minutes. Customers can retry from `/order/[id]`.
4. The webhook (`/api/payments/webhook`) confirms orders even if the customer closes the tab before the browser callback — configure it (see table above).
If keys are missing, online payment returns a friendly error and COD still works.

## Admin setup

1. Put `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in `.env.local`.
2. `npm run seed` (or `npm run seed -- --admin-only` to create just the admin).
3. Sign in at `/login`, then open `/admin`.
Admin access is enforced three times: middleware, the admin layout, and `requireAdmin()` in every `/api/admin/*` handler.
The seed refuses to run with `NODE_ENV=production` unless `--force` is passed. Self-registration never creates admins.

## Seed data

`npm run seed` creates: 8 categories, 6 collections, 30 products (INR prices), 10 testimonials, 15 reviews, 10 customers,
10 orders in varied statuses, 3 coupons (`WELCOME10`, `FLAT200`, `FESTIVE15`), newsletter subscribers, and all homepage
CMS sections. It wipes previous demo data first. The demo customers' shared password is printed once in the console.

Images are original generated SVG artwork in `public/images/{products,categories,editorial,banners,hero,social,collections}`.
Replace any file with real photography (same filename), or upload through the admin and use Cloudinary URLs.

## Commands

```bash
npm run dev        # development
npm run build      # production build
npm run start      # run the production build
npm run lint       # ESLint (next lint)
npm run typecheck  # tsc --noEmit
npm run seed       # seed database
npm run images     # regenerate placeholder artwork
```

## Deployment (Vercel + Atlas + Cloudinary + Razorpay)

1. Push the repo to GitHub and import it in Vercel.
2. Add every variable from `.env.example` in *Project → Settings → Environment Variables*
   (`NEXT_PUBLIC_APP_URL` = your production URL; `AUTH_TRUST_HOST=true`).
3. In Atlas, allow Vercel's egress IPs. In Google Cloud, add the production redirect URI.
4. Seed production once from your machine: `NODE_ENV=production npm run seed -- --admin-only --force`
   (use a production `MONGODB_URI` in a temporary env; never commit it).
5. Switch Razorpay to live keys when ready.

## Architecture notes

```
app/(store)/…      storefront routes (own layout: navbar, footer, drawers)
app/admin/…        admin routes (own layout + sidebar, server-side role check)
app/api/…          route handlers (customer APIs + /api/admin/* generic CRUD)
components/…       ui/ (primitives), layout/, home/, product/, shop/, cart/, account/, auth/, admin/
lib/               db, auth helpers, validators (Zod), pricing, coupons, orders (stock), data (server readers)
models/            Mongoose models (User, Product, Category, Collection, Order(+OrderItem), Cart, Wishlist,
                   Review, Coupon, Address, Banner, HomepageSection, Testimonial, NewsletterSubscriber, SiteSettings)
actions/           server actions (newsletter)
store/             Zustand (cart, wishlist, ui)
scripts/           seed.ts, generate-images.mjs, catalog.mjs
```

- **Rendering:** the root layout is `force-dynamic` so CMS/admin changes show immediately. For higher traffic, replace with
  `revalidate` + `revalidatePath` (already called on settings/homepage saves) or `unstable_cache` in `lib/data.ts`.
- **Prices:** GST-inclusive; tax is shown as an included amount, not added to the total (`lib/pricing.ts`).
- **Inventory:** `stock` − `reserved` = available. Orders reserve → commit on payment/COD → release on cancel/return.
- **Security:** Zod validation on every endpoint, bcrypt hashing, role checks server-side, rate limiting, security headers,
  upload type/size limits, no secrets in client bundles. The rate limiter is in-memory (per instance); use Upstash/Redis for
  multi-instance production.
- **Generic admin CRUD:** `lib/admin-resources.ts` maps resource → model + Zod schema; one UI (`ResourceManager`) powers
  products, categories, collections, coupons, banners, testimonials, reviews, newsletter.

## First run checklist

1. `npm install` — if peer-dependency warnings block it, use `npm install --legacy-peer-deps`.
2. `npm run typecheck` and `npm run lint` — fix anything reported (this code has never been compiled).
3. `npm run build`.
4. Smoke test: register → add to cart → checkout (COD) → see order → sign in as admin → change order status →
   edit a homepage section → create a product.

## Known limitations

- Not compiled or run by the author; see checklist.
- Placeholder SVG artwork instead of photography.
- No real email provider configured by default; no shipping-carrier API integration.
- Conversion-rate analytics needs a traffic source (GA4/Plausible); the UI shows the structure.
- Default Privacy/Terms pages contain placeholder text that needs legal review.
