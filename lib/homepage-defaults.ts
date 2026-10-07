/** Default homepage content. Any section saved in the database (Admin → Homepage) overrides these. */
export type SectionKey =
  | "hero" | "marquee" | "categories" | "newArrivals" | "editorial" | "collectionBanner"
  | "bestSellers" | "promo" | "story" | "testimonials" | "social" | "newsletter" | "footer";

export const HOMEPAGE_DEFAULTS: Record<SectionKey, { enabled: boolean; data: Record<string, any> }> = {
  hero: {
    enabled: true,
    data: {
      eyebrow: "NEW SEASON",
      heading: "THE ART OF EVERYDAY",
      subheading: "Discover the new collection.",
      image: "/images/hero/hero.svg",
      primaryText: "SHOP MEN",
      primaryHref: "/shop?gender=men",
      secondaryText: "SHOP WOMEN",
      secondaryHref: "/shop?gender=women",
    },
  },
  marquee: { enabled: true, data: { items: ["CRAFTED FOR EVERYDAY", "DESIGNED FOR YOU", "DEFINED BY STYLE"] } },
  categories: { enabled: true, data: { eyebrow: "Explore", heading: "Shop by Category" } },
  newArrivals: { enabled: true, data: { eyebrow: "Just Landed", heading: "New Arrivals", productIds: [] } },
  editorial: {
    enabled: true,
    data: {
      heading: "THE NEW STANDARD",
      text: "Minimal silhouettes. Refined details. Designed for modern life.",
      ctaText: "EXPLORE COLLECTION",
      ctaHref: "/shop?new=1",
      image1: "/images/editorial/e1.svg",
      image2: "/images/editorial/e2.svg",
      image3: "/images/editorial/e3.svg",
    },
  },
  collectionBanner: {
    enabled: true,
    data: {
      heading: "THE WEEKEND EDIT",
      subheading: "Effortless pieces for every plan.",
      ctaText: "SHOP THE COLLECTION",
      ctaHref: "/collections/weekend-edit",
      image: "/images/editorial/collection.svg",
    },
  },
  bestSellers: { enabled: true, data: { eyebrow: "Most Loved", heading: "Best Sellers", productIds: [] } },
  promo: {
    enabled: true,
    data: { heading: "UP TO 30% OFF", subheading: "Selected styles. Limited time.", ctaText: "SHOP SALE", ctaHref: "/shop?sale=1" },
  },
  story: {
    enabled: true,
    data: {
      eyebrow: "Our Story",
      heading: "BUILT AROUND YOUR STYLE.",
      text: "Thoughtfully designed clothing made for modern everyday life.",
      ctaText: "OUR STORY",
      ctaHref: "/our-story",
      image: "/images/editorial/story.svg",
    },
  },
  testimonials: { enabled: true, data: { eyebrow: "Happy Customers", heading: "Loved by those who wear it" } },
  social: {
    enabled: true,
    data: {
      heading: "@verano.wear",
      ctaText: "FOLLOW OUR JOURNEY",
      ctaHref: "https://instagram.com",
      images: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `/images/social/s${n}.svg`),
    },
  },
  newsletter: {
    enabled: true,
    data: {
      heading: "STAY IN THE LOOP",
      text: "Be the first to discover new collections, exclusive drops and private offers.",
    },
  },
  footer: {
    enabled: true,
    data: { about: "Thoughtfully designed clothing made for modern everyday life.", copyright: "All rights reserved." },
  },
};

export type FieldType = "text" | "textarea" | "image" | "images" | "list" | "products";
export interface SectionField { name: string; label: string; type: FieldType; max?: number }

/** Drives the schema-based editor in Admin → Homepage. */
export const SECTION_SCHEMA: Record<SectionKey, { label: string; note?: string; fields: SectionField[] }> = {
  hero: {
    label: "Hero",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "heading", label: "Heading", type: "text" },
      { name: "subheading", label: "Subtitle", type: "text" },
      { name: "image", label: "Background image", type: "image" },
      { name: "primaryText", label: "Primary button text", type: "text" },
      { name: "primaryHref", label: "Primary button link", type: "text" },
      { name: "secondaryText", label: "Secondary button text", type: "text" },
      { name: "secondaryHref", label: "Secondary button link", type: "text" },
    ],
  },
  marquee: { label: "Marquee statement", fields: [{ name: "items", label: "Statements", type: "list" }] },
  categories: {
    label: "Categories",
    note: "Cards are generated from active categories (Admin → Categories).",
    fields: [{ name: "eyebrow", label: "Eyebrow", type: "text" }, { name: "heading", label: "Heading", type: "text" }],
  },
  newArrivals: {
    label: "New arrivals",
    note: "Leave products empty to show the newest products automatically.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "heading", label: "Heading", type: "text" },
      { name: "productIds", label: "Featured products (optional)", type: "products", max: 8 },
    ],
  },
  editorial: {
    label: "Editorial",
    fields: [
      { name: "heading", label: "Heading", type: "text" },
      { name: "text", label: "Text", type: "textarea" },
      { name: "ctaText", label: "Button text", type: "text" },
      { name: "ctaHref", label: "Button link", type: "text" },
      { name: "image1", label: "Large image (4:5)", type: "image" },
      { name: "image2", label: "Small image 1 (3:4)", type: "image" },
      { name: "image3", label: "Small image 2 (3:4)", type: "image" },
    ],
  },
  collectionBanner: {
    label: "Collection banner",
    fields: [
      { name: "heading", label: "Heading", type: "text" },
      { name: "subheading", label: "Subtitle", type: "text" },
      { name: "ctaText", label: "Button text", type: "text" },
      { name: "ctaHref", label: "Button link", type: "text" },
      { name: "image", label: "Background image (16:9)", type: "image" },
    ],
  },
  bestSellers: {
    label: "Best sellers",
    note: "Leave products empty to show products flagged as best sellers.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "heading", label: "Heading", type: "text" },
      { name: "productIds", label: "Featured products (optional)", type: "products", max: 8 },
    ],
  },
  promo: {
    label: "Promotional banner",
    fields: [
      { name: "heading", label: "Heading", type: "text" },
      { name: "subheading", label: "Subtitle", type: "text" },
      { name: "ctaText", label: "Button text", type: "text" },
      { name: "ctaHref", label: "Button link", type: "text" },
    ],
  },
  story: {
    label: "Brand story",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "heading", label: "Heading", type: "text" },
      { name: "text", label: "Text", type: "textarea" },
      { name: "ctaText", label: "Button text", type: "text" },
      { name: "ctaHref", label: "Button link", type: "text" },
      { name: "image", label: "Image", type: "image" },
    ],
  },
  testimonials: {
    label: "Testimonials",
    note: "Reviews shown here are managed in Admin → Testimonials.",
    fields: [{ name: "eyebrow", label: "Eyebrow", type: "text" }, { name: "heading", label: "Heading", type: "text" }],
  },
  social: {
    label: "Social grid",
    fields: [
      { name: "heading", label: "Handle / heading", type: "text" },
      { name: "ctaText", label: "Button text", type: "text" },
      { name: "ctaHref", label: "Button link", type: "text" },
      { name: "images", label: "Images (6-8)", type: "images", max: 8 },
    ],
  },
  newsletter: {
    label: "Newsletter",
    fields: [{ name: "heading", label: "Heading", type: "text" }, { name: "text", label: "Text", type: "textarea" }],
  },
  footer: {
    label: "Footer",
    fields: [
      { name: "about", label: "About text", type: "textarea" },
      { name: "copyright", label: "Copyright suffix", type: "text" },
    ],
  },
};

export const SECTION_KEYS = Object.keys(HOMEPAGE_DEFAULTS) as SectionKey[];
