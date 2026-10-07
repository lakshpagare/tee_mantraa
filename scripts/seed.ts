/**
 * Development seed. Usage:
 *   npm run seed                 -> admin user + full demo data (replaces previous demo data)
 *   npm run seed -- --admin-only -> only create/update the admin user
 * Admin credentials come from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD (never hard-coded).
 * Refuses to run when NODE_ENV=production unless --force is passed.
 */
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";

dotenv.config({ path: ".env.local" });
dotenv.config();

import { User } from "../models/User";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { Collection } from "../models/Collection";
import { Order } from "../models/Order";
import { Cart } from "../models/Cart";
import { Wishlist } from "../models/Wishlist";
import { Review } from "../models/Review";
import { Coupon } from "../models/Coupon";
import { Address } from "../models/Address";
import { Banner } from "../models/Banner";
import { HomepageSection } from "../models/HomepageSection";
import { Testimonial } from "../models/Testimonial";
import { NewsletterSubscriber } from "../models/NewsletterSubscriber";
import { SiteSettings } from "../models/SiteSettings";
import { recomputeRating } from "../lib/reviews";
import { computeTotals } from "../lib/pricing";
import { HOMEPAGE_DEFAULTS } from "../lib/homepage-defaults";
import { CATEGORIES, COLLECTIONS, COLOR_HEX, PRODUCTS } from "./catalog.mjs";

const args = process.argv.slice(2);
const DEMO_DOMAIN = "demo.verano.test";

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(42);
const pick = <T,>(a: T[]): T => a[Math.floor(rand() * a.length)];
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env.local before seeding.");
  if (password.length < 10) throw new Error("SEED_ADMIN_PASSWORD must be at least 10 characters.");
  const passwordHash = await bcrypt.hash(password, 12);
  await User.findOneAndUpdate(
    { email },
    { name: process.env.SEED_ADMIN_NAME || "Store Admin", email, passwordHash, role: "ADMIN", status: "active", provider: "credentials", emailVerified: new Date() },
    { upsert: true, new: true }
  );
  console.log(`✔ Admin ready: ${email}`);
}

async function seedDemo() {
  const demoPassword = crypto.randomBytes(6).toString("hex") + "A1!";
  const demoHash = await bcrypt.hash(demoPassword, 10);

  // ---- wipe previous demo data ----
  const demoUsers = await User.find({ email: new RegExp(`@${DEMO_DOMAIN.replace(/\./g, "\\.")}$`) }).select("_id");
  const ids = demoUsers.map((u: any) => u._id);
  await Promise.all([
    Category.deleteMany({}), Product.deleteMany({}), Collection.deleteMany({}), Review.deleteMany({}), Testimonial.deleteMany({}),
    Coupon.deleteMany({}), Banner.deleteMany({}), HomepageSection.deleteMany({}), NewsletterSubscriber.deleteMany({}),
    Order.deleteMany({}), Cart.deleteMany({ user: { $in: ids } }), Wishlist.deleteMany({ user: { $in: ids } }),
    Address.deleteMany({ user: { $in: ids } }), User.deleteMany({ _id: { $in: ids } }),
  ]);

  // ---- settings & homepage CMS ----
  await SiteSettings.findOneAndUpdate({ key: "site" }, { key: "site" }, { upsert: true });
  await HomepageSection.insertMany(Object.entries(HOMEPAGE_DEFAULTS).map(([key, v]) => ({ key, enabled: v.enabled, data: v.data })));

  // ---- categories ----
  const cats: any[] = await Category.insertMany(CATEGORIES.map((c: any, i: number) => ({ name: c.name, slug: c.slug, description: c.description, image: `/images/categories/${c.slug}.svg`, banner: `/images/categories/${c.slug}.svg`, active: true, sortOrder: i })));
  const catBySlug = new Map(cats.map((c) => [c.slug, c]));

  // ---- products ----
  const prefix: Record<string, string> = { shirts: "SHT", "t-shirts": "TEE", hoodies: "HOD", jeans: "JNS", jackets: "JKT", trousers: "TRS", accessories: "ACC" };
  const docs = PRODUCTS.map((p: any, i: number) => {
    const stock = i === 4 ? 2 : i === 17 ? 0 : i === 9 ? 4 : int(14, 80);
    return {
      name: p.name, slug: p.slug, sku: `VR-${prefix[p.category]}-${String(i + 1).padStart(3, "0")}`,
      shortDescription: p.short,
      description: `${p.short}\n\nCut for everyday wear and finished with considered details. Made from ${p.material.toLowerCase()} for a feel that gets better with wear.\n\nCare: machine wash cold with similar colours, line dry, warm iron if needed.`,
      price: p.price, compareAtPrice: p.compareAt || undefined, costPrice: Math.round(p.price * 0.42),
      category: catBySlug.get(p.category)._id, subcategory: p.type === "bag" ? "Accessories" : undefined, brand: "VÉRANO",
      images: [`/images/products/${p.slug}-1.svg`, `/images/products/${p.slug}-2.svg`],
      colors: p.colors.map((n: string) => ({ name: n, hex: COLOR_HEX[n] })), sizes: p.sizes,
      stock, lowStockThreshold: 5, material: p.material, fit: p.fit, gender: p.gender,
      tags: [p.category, p.type, p.gender, ...p.name.toLowerCase().split(" ")],
      featured: p.flags.includes("B"), bestSeller: p.flags.includes("B"), newArrival: p.flags.includes("N"), published: true,
      sold: 0,
    };
  });
  const products: any[] = await Product.insertMany(docs);
  const prodBySlug = new Map(products.map((p) => [p.slug, p]));

  // ---- collections ----
  await Collection.insertMany(COLLECTIONS.map((c: any, i: number) => ({
    name: c.name, slug: c.slug, description: c.description, image: `/images/collections/${c.slug}.svg`, active: true, sortOrder: i,
    products: PRODUCTS.filter((p: any) => p.collections.includes(c.slug)).map((p: any) => prodBySlug.get(p.slug)._id),
  })));

  // ---- customers (+ addresses) ----
  const people = [
    ["Aarav Sharma", "Mumbai", "Maharashtra", "400050"], ["Diya Patel", "Ahmedabad", "Gujarat", "380015"], ["Rohan Mehta", "Pune", "Maharashtra", "411001"],
    ["Ananya Iyer", "Bengaluru", "Karnataka", "560034"], ["Kabir Singh", "New Delhi", "Delhi", "110016"], ["Meera Nair", "Kochi", "Kerala", "682016"],
    ["Vihaan Reddy", "Hyderabad", "Telangana", "500081"], ["Ishita Das", "Kolkata", "West Bengal", "700019"], ["Arjun Kapoor", "Jaipur", "Rajasthan", "302001"], ["Saanvi Joshi", "Chennai", "Tamil Nadu", "600020"],
  ];
  const customers: any[] = [];
  for (const [i, [name, city, state, pincode]] of people.entries()) {
    const email = `${name.toLowerCase().replace(" ", ".")}@${DEMO_DOMAIN}`;
    const u: any = await User.create({ name, email, phone: `98${int(10000000, 99999999)}`, passwordHash: demoHash, role: "USER", emailVerified: new Date(), createdAt: new Date(Date.now() - int(5, 90) * 86400000) });
    await Address.create({ user: u._id, label: "Home", fullName: name, phone: u.phone, line1: `${int(2, 220)}, ${pick(["MG Road", "Park Street", "Lake View Apartments", "Green Avenue", "Station Road"])}`, city, state, pincode, isDefault: true });
    customers.push({ doc: u, city, state, pincode, i });
  }

  // ---- testimonials ----
  const quotes: [string, string, string][] = [
    ["Priya R.", "Linen Resort Shirt", "The fabric is unreal for the price. I've worn it every weekend since it arrived."],
    ["Karan M.", "Heavyweight Boxy Tee", "Finally a tee that holds its shape after washing. Ordering two more colours."],
    ["Neha S.", "Wide-Leg Jeans", "Perfect length and the drape is beautiful. Feels premium without the markup."],
    ["Aditya V.", "Bomber Jacket", "Clean, minimal and fits exactly as the size guide says. Compliments every time."],
    ["Zoya K.", "Cropped Hoodie", "So soft inside and the cut is spot on. Delivery was quicker than promised."],
    ["Rahul D.", "Pleated Chinos", "My new work-to-weekend trousers. The fit is relaxed but still sharp."],
    ["Tanvi P.", "Drawstring Linen Trousers", "Breezy, comfortable and they look expensive. Love them in Olive."],
    ["Siddharth B.", "Core Pullover Hoodie", "Dense fleece, great hood, no pilling. Easily the best hoodie I own."],
    ["Mehul T.", "Oxford Button-Down", "A proper oxford with a soft hand-feel. Packaging felt premium too."],
    ["Pooja L.", "Canvas Tote", "Sturdy, roomy and goes with everything. Easy returns policy gave me confidence."],
  ];
  await Testimonial.insertMany(quotes.map(([name, product, text], i) => ({ name, product, text, rating: i % 4 === 3 ? 4 : 5, verified: true, active: true, sortOrder: i })));

  // ---- coupons & banner & newsletter ----
  const now = Date.now();
  await Coupon.insertMany([
    { code: "WELCOME10", description: "10% off your first order", type: "PERCENT", value: 10, minOrder: 999, maxDiscount: 500, perUserLimit: 1, active: true, startDate: new Date(now - 86400000), expiryDate: new Date(now + 365 * 86400000) },
    { code: "FLAT200", description: "₹200 off orders above ₹1,499", type: "FIXED", value: 200, minOrder: 1499, perUserLimit: 3, usageLimit: 500, active: true, expiryDate: new Date(now + 180 * 86400000) },
    { code: "FESTIVE15", description: "15% off, up to ₹750", type: "PERCENT", value: 15, minOrder: 2499, maxDiscount: 750, perUserLimit: 1, active: true, expiryDate: new Date(now + 60 * 86400000) },
  ]);
  await Banner.create({ title: "FESTIVE EDIT — EXTRA 15% OFF", subtitle: "Use code FESTIVE15 on orders above ₹2,499.", image: "/images/banners/promo.svg", ctaText: "SHOP NOW", ctaLink: "/shop", active: false });
  await NewsletterSubscriber.insertMany(["a.verma", "s.menon", "kiran.p", "lena.d", "farhan.q"].map((n) => ({ email: `${n}@${DEMO_DOMAIN}` })));

  // ---- orders (10) ----
  const statuses = ["Delivered", "Delivered", "Delivered", "Shipped", "Out for Delivery", "Processing", "Confirmed", "Pending", "Cancelled", "Returned"];
  const flow = ["Pending", "Confirmed", "Processing", "Shipped", "Out for Delivery", "Delivered"];
  const settings = { freeShippingThreshold: 1999, shippingFee: 99, expressFee: 149, taxRate: 12 };
  for (let n = 0; n < 10; n++) {
    const c = customers[n];
    const status = statuses[n];
    const picks = Array.from({ length: int(1, 3) }, () => pick(products));
    const items = [...new Map(picks.map((p) => [p._id.toString(), p])).values()].map((p: any) => ({
      product: p._id, name: p.name, slug: p.slug, image: p.images[0], sku: p.sku, size: pick(p.sizes), color: pick(p.colors as any[]).name, price: p.price, quantity: int(1, 2),
    }));
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const discount = n % 4 === 0 ? Math.min(200, subtotal) : 0;
    const totals = computeTotals(subtotal, discount, n % 5 === 4 ? "express" : "standard", settings);
    const created = new Date(now - (n * 4 + int(1, 3)) * 86400000);
    const cod = n % 3 === 0;
    const cancelled = status === "Cancelled" || status === "Returned";
    const idx = flow.indexOf(status);
    const timeline = (cancelled ? ["Pending", "Confirmed", status] : flow.slice(0, idx + 1)).map((s, k) => ({ status: s, note: k === 0 ? "Order placed" : `Marked ${s}`, at: new Date(created.getTime() + k * 8 * 3600000) }));
    const y = created, ymd = `${y.getFullYear()}${String(y.getMonth() + 1).padStart(2, "0")}${String(y.getDate()).padStart(2, "0")}`;
    await Order.create({
      orderNumber: `VR-${ymd}-${1000 + n * 37}${n}`, user: c.doc._id, items,
      shippingAddress: { fullName: c.doc.name, email: c.doc.email, phone: c.doc.phone, line1: "12, Sample Street", city: c.city, state: c.state, pincode: c.pincode, country: "India" },
      deliveryMethod: n % 5 === 4 ? "express" : "standard", ...totals, couponCode: discount ? "FLAT200" : undefined,
      paymentMethod: cod ? "COD" : "RAZORPAY",
      paymentStatus: status === "Pending" ? "PENDING" : status === "Returned" ? "REFUNDED" : status === "Cancelled" ? "FAILED" : cod && status !== "Delivered" ? "PENDING" : "PAID",
      razorpayOrderId: cod ? undefined : `order_demo${n}`, razorpayPaymentId: !cod && status !== "Pending" && status !== "Cancelled" ? `pay_demo${n}` : undefined,
      status, stockState: cancelled ? "RELEASED" : status === "Pending" ? "RESERVED" : "COMMITTED", timeline, createdAt: created, updatedAt: created,
    });
    if (!cancelled) {
      for (const i of items) {
        const committed = status !== "Pending";
        await Product.updateOne({ _id: i.product }, committed ? { $inc: { stock: -i.quantity, sold: i.quantity } } : { $inc: { reserved: i.quantity } });
      }
    }
  }
  // Give demo products some historical sales volume so "best selling" sorting is meaningful.
  for (const p of products) await Product.updateOne({ _id: p._id }, { $inc: { sold: p.bestSeller ? int(120, 400) : int(5, 90) } });

  // ---- reviews (15) ----
  const comments = [
    "Fits true to size and the fabric feels far more expensive than the price.", "Great quality. Washed it several times and it still looks new.", "Lovely colour and a very flattering cut. Would buy again.",
    "Comfortable all day. The details — stitching, buttons — are really well done.", "Delivery was fast and the packaging was lovely. The fit is spot on.", "A bit relaxed for my taste, but the quality is excellent.",
    "Exactly like the photos. Soft fabric and a clean silhouette.", "My new favourite. Already ordered a second colour.", "Good value for money and easy returns made me comfortable ordering.",
  ];
  const reviewed = new Set<string>();
  const reviewDocs: any[] = [];
  let guard = 0;
  while (reviewDocs.length < 15 && guard++ < 200) {
    const p = pick(products), u = pick(customers).doc;
    const key = `${p._id}|${u._id}`;
    if (reviewed.has(key)) continue;
    reviewed.add(key);
    reviewDocs.push({ product: p._id, user: u._id, name: u.name, rating: pick([5, 5, 5, 4, 4, 3]), title: pick(["Love it", "Great quality", "Worth it", "Solid everyday piece", "Really happy"]), comment: pick(comments), verified: true, status: "APPROVED", featured: reviewDocs.length < 3 });
  }
  await Review.insertMany(reviewDocs);
  for (const pid of new Set(reviewDocs.map((r) => r.product.toString()))) await recomputeRating(pid);

  // ---- indexes ----
  await Promise.all([User, Category, Product, Collection, Order, Review, Coupon].map((m: any) => m.syncIndexes()));

  console.log(`✔ Demo data: ${cats.length} categories, ${products.length} products, ${COLLECTIONS.length} collections, 10 customers, 10 testimonials, ${reviewDocs.length} reviews, 10 orders, 3 coupons`);
  console.log(`  Demo customer logins: <name>@${DEMO_DOMAIN} (e.g. aarav.sharma@${DEMO_DOMAIN}) — password for this run: ${demoPassword}`);
  console.log("  Try coupon codes: WELCOME10, FLAT200, FESTIVE15");
}

async function main() {
  if (process.env.NODE_ENV === "production" && !args.includes("--force")) {
    throw new Error("Refusing to seed with NODE_ENV=production. Pass --force if you really mean it.");
  }
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set.");
  await mongoose.connect(process.env.MONGODB_URI);
  await seedAdmin();
  if (!args.includes("--admin-only")) await seedDemo();
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error("✖ Seed failed:", e.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
