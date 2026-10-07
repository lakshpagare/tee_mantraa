# VÉRANO — Premium Clothing E-commerce

A complete Next.js (App Router) fashion storefront with customer accounts, cart, checkout (Razorpay + Cash on Delivery),
orders, reviews, coupons, a full admin panel, a homepage CMS and analytics. Visual language is inspired by editorial
fashion sites: large imagery, serif display type, generous whitespace, restrained motion.

> **Status:** this codebase was written without the ability to run `npm install`, `npm run build` or `npm run lint`.
> Expect to fix a handful of type/lint errors on the first build. See [First run checklist](#first-run-checklist).

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
Optional: Google (`GOOGLE_CLIENT_ID/SECRET`), Cloudinary, Razorpay, Resend (`RESEND_API_KEY`), `REQUIRE_EMAIL_VERIFICATION`.
Seed: `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` (min 10 chars), `SEED_ADMIN_NAME`.
Generate a secret with `openssl rand -base64 32`. Secret keys are only read on the server; the only `NEXT_PUBLIC_` values
are the app URL and (optionally) the Razorpay **key id**.

## MongoDB setup

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user, and allow your IP (for Vercel: allow `0.0.0.0/0` or use Atlas's Vercel integration).
3. Copy the connection string into `MONGODB_URI` (include the database name, e.g. `/verano`).
Local alternative: `mongodb://127.0.0.1:27017/verano`.

## Authentication setup

- **Email/password** works out of the box. Passwords are hashed with bcrypt (cost 12). In development the verification and
  reset links are logged to the server console (and shown on screen). In production set `RESEND_API_KEY` + `MAIL_FROM`.
- **Google**: create OAuth credentials in Google Cloud Console → *Authorized redirect URI*:
  `http://localhost:3000/api/auth/callback/google` (and your production URL). Set `GOOGLE_CLIENT_ID/SECRET`.
  If unset, the Google button is shown but sign-in will fail — hide it in `components/auth/login-form.tsx` if you prefer.
- Roles: `USER`, `ADMIN` in use; `STAFF` and `SUPER_ADMIN` exist in the enum for future work (`lib/constants.ts`).

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
4. **Recommended before launch:** add a Razorpay webhook (`payment.captured`) for the edge case where a customer pays and
   closes the tab before verification. The order is left reviewable (“Paid after reservation expired”) but a webhook is the
   robust fix.
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
- No Razorpay webhook, no real email provider configured by default, no shipping-carrier integration.
- Conversion-rate analytics needs a traffic source (GA4/Plausible); the UI shows the structure.
- Default Privacy/Terms pages contain placeholder text that needs legal review.
