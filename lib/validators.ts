import { z } from "zod";

const emptyToUndef = (v: unknown) => (v === "" || v === null ? undefined : v);
const optDate = z.preprocess(emptyToUndef, z.coerce.date().optional());
const optNum = z.preprocess(emptyToUndef, z.coerce.number().min(0).optional());
const str = (max = 200) => z.string().trim().max(max);

export const emailField = z.string().trim().toLowerCase().email("Enter a valid email address");
export const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number");

export const loginSchema = z.object({ email: emailField, password: z.string().min(1, "Enter your password").max(72) });
export const registerSchema = z.object({
  name: str(80).min(2, "Enter your full name"),
  email: emailField,
  password: passwordField,
});
export const forgotSchema = z.object({ email: emailField });
export const resetSchema = z.object({ token: z.string().min(10), email: emailField, password: passwordField });
export const newsletterSchema = z.object({ email: emailField });
export const changePasswordSchema = z.object({ current: z.string().min(1), next: passwordField });
export const profileSchema = z.object({
  name: str(80).min(2),
  phone: z.preprocess(emptyToUndef, z.string().trim().regex(/^[0-9+\-\s]{8,15}$/, "Enter a valid phone number").optional()),
});

export const addressSchema = z.object({
  label: str(30).optional(),
  fullName: str(80).min(2, "Enter the recipient's name"),
  phone: z.string().trim().regex(/^[0-9+\-\s]{8,15}$/, "Enter a valid phone number"),
  line1: str(150).min(3, "Enter your address"),
  line2: z.preprocess(emptyToUndef, str(150).optional()),
  city: str(60).min(2, "Enter your city"),
  state: str(60).min(2, "Select your state"),
  pincode: z.string().trim().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit PIN code"),
  isDefault: z.boolean().optional(),
});

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().length(24),
        size: str(20),
        color: str(40),
        quantity: z.number().int().min(1).max(10),
      })
    )
    .min(1, "Your cart is empty")
    .max(40),
  address: addressSchema.extend({ email: emailField }),
  deliveryMethod: z.enum(["standard", "express"]),
  paymentMethod: z.enum(["RAZORPAY", "COD"]),
  couponCode: z.preprocess(emptyToUndef, str(30).optional()),
});

export const reviewSchema = z.object({
  productId: z.string().length(24),
  rating: z.number().int().min(1).max(5),
  title: z.preprocess(emptyToUndef, str(100).optional()),
  comment: str(2000).min(10, "Please write at least 10 characters"),
  image: z.preprocess(emptyToUndef, z.string().url().or(z.string().startsWith("/uploads/")).optional()),
});

// ---------- Admin resource schemas ----------
const slugField = z.preprocess(emptyToUndef, z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/, "Slug may contain a-z, 0-9 and hyphens").optional());

export const productSchema = z.object({
  name: str(150).min(2),
  slug: slugField,
  description: str(8000).optional().default(""),
  shortDescription: str(300).optional().default(""),
  price: z.coerce.number().min(0),
  compareAtPrice: optNum,
  costPrice: optNum,
  sku: str(40).min(2),
  category: z.preprocess(emptyToUndef, z.string().length(24).optional()),
  subcategory: z.preprocess(emptyToUndef, str(60).optional()),
  brand: str(60).optional().default("VÉRANO"),
  images: z.array(z.string().min(1)).max(12).default([]),
  colors: z.array(z.object({ name: str(40).min(1), hex: z.string().regex(/^#[0-9a-fA-F]{6}$/) })).default([]),
  sizes: z.array(str(20).min(1)).default([]),
  stock: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  material: z.preprocess(emptyToUndef, str(200).optional()),
  fit: z.preprocess(emptyToUndef, str(200).optional()),
  gender: z.enum(["men", "women", "unisex"]).default("unisex"),
  tags: z.array(str(30)).default([]),
  featured: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  published: z.boolean().default(true),
});

export const categorySchema = z.object({
  name: str(80).min(2),
  slug: slugField,
  description: str(500).optional().default(""),
  image: z.string().optional().default(""),
  banner: z.string().optional().default(""),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export const collectionSchema = z.object({
  name: str(80).min(2),
  slug: slugField,
  description: str(500).optional().default(""),
  image: z.string().optional().default(""),
  products: z.array(z.string().length(24)).default([]),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export const couponSchema = z
  .object({
    code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,30}$/, "Use 3-30 letters, numbers, - or _"),
    description: z.preprocess(emptyToUndef, str(200).optional()),
    type: z.enum(["PERCENT", "FIXED"]),
    value: z.coerce.number().min(1),
    minOrder: z.coerce.number().min(0).default(0),
    maxDiscount: optNum,
    usageLimit: optNum,
    perUserLimit: z.coerce.number().int().min(1).default(1),
    startDate: optDate,
    expiryDate: optDate,
    active: z.boolean().default(true),
  })
  .refine((c) => c.type !== "PERCENT" || c.value <= 100, { message: "Percentage cannot exceed 100", path: ["value"] });

export const bannerSchema = z.object({
  title: str(120).min(2),
  subtitle: z.preprocess(emptyToUndef, str(200).optional()),
  image: z.string().optional().default(""),
  ctaText: z.preprocess(emptyToUndef, str(40).optional()),
  ctaLink: z.preprocess(emptyToUndef, str(200).optional()),
  startDate: optDate,
  endDate: optDate,
  active: z.boolean().default(true),
});

export const testimonialSchema = z.object({
  name: str(80).min(2),
  product: z.preprocess(emptyToUndef, str(100).optional()),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  text: str(600).min(5),
  verified: z.boolean().default(true),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export const reviewModerationSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  featured: z.boolean().optional(),
});

export const newsletterAdminSchema = z.object({ active: z.boolean() });

export const settingsSchema = z.object({
  brandName: str(40).min(1),
  tagline: str(120),
  announcement: str(160),
  freeShippingThreshold: z.coerce.number().min(0),
  shippingFee: z.coerce.number().min(0),
  expressFee: z.coerce.number().min(0),
  taxRate: z.coerce.number().min(0).max(40),
  contactEmail: emailField,
  contactPhone: str(30),
  instagram: str(200),
  facebook: str(200),
  youtube: str(200),
});

/** Client-side form schema (no preprocessors, so it infers cleanly for react-hook-form). */
export const addressFormSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the recipient's name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z.string().trim().regex(/^[0-9+\-\s]{8,15}$/, "Enter a valid phone number"),
  line1: z.string().trim().min(3, "Enter your address").max(150),
  line2: z.string().trim().max(150).optional(),
  city: z.string().trim().min(2, "Enter your city").max(60),
  state: z.string().trim().min(2, "Select your state"),
  pincode: z.string().trim().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit PIN code"),
});
export type AddressForm = z.infer<typeof addressFormSchema>;

export const loginFormSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
export type LoginForm = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name").max(80),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    password: z.string().min(8, "At least 8 characters").max(72).regex(/[A-Za-z]/, "Include a letter").regex(/[0-9]/, "Include a number"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords do not match", path: ["confirm"] });
export type RegisterForm = z.infer<typeof registerFormSchema>;
