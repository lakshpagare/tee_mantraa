export interface CategoryRef { _id: string; name: string; slug: string }

export interface ProductDTO {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  category?: CategoryRef | string | null;
  subcategory?: string;
  brand?: string;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  stock: number;
  reserved: number;
  lowStockThreshold: number;
  material?: string;
  fit?: string;
  gender: "men" | "women" | "unisex";
  tags: string[];
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  published: boolean;
  rating: number;
  reviewCount: number;
  sold: number;
  createdAt?: string;
}

export interface CategoryDTO {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  banner?: string;
  active: boolean;
  sortOrder: number;
}

export interface CollectionDTO {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  products?: string[];
  active: boolean;
}

export interface ReviewDTO {
  _id: string;
  name: string;
  rating: number;
  title?: string;
  comment: string;
  image?: string;
  verified: boolean;
  createdAt: string;
}

export interface TestimonialDTO {
  _id: string;
  name: string;
  product?: string;
  rating: number;
  text: string;
  verified: boolean;
}

export interface SiteSettingsDTO {
  brandName: string;
  tagline: string;
  announcement: string;
  freeShippingThreshold: number;
  shippingFee: number;
  expressFee: number;
  taxRate: number;
  contactEmail: string;
  contactPhone: string;
  instagram: string;
  facebook: string;
  youtube: string;
}

export interface CartItem {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  size: string;
  color: string;
  quantity: number;
  maxQty: number;
}
