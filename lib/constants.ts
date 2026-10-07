export const ROLES = ["USER", "STAFF", "ADMIN", "SUPER_ADMIN"] as const;
export type Role = (typeof ROLES)[number];
/** Roles allowed into the admin panel. STAFF is reserved for future, scoped access. */
export const ADMIN_ROLES: Role[] = ["ADMIN", "SUPER_ADMIN"];
export const isAdminRole = (r?: string | null) => !!r && ADMIN_ROLES.includes(r as Role);

export const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Returned",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Customer-facing progress steps mapped to underlying statuses. */
export const TIMELINE_STEPS: { label: string; status: OrderStatus }[] = [
  { label: "Order placed", status: "Pending" },
  { label: "Confirmed", status: "Confirmed" },
  { label: "Packed", status: "Processing" },
  { label: "Shipped", status: "Shipped" },
  { label: "Delivered", status: "Delivered" },
];

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "best-selling", label: "Best Selling" },
  { value: "top-rated", label: "Top Rated" },
];

export const TRENDING_SEARCHES = ["Linen shirt", "Oversized hoodie", "Wide-leg jeans", "Bomber jacket", "Cargo trousers"];

export const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh",
  "Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha",
  "Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Delhi","Jammu and Kashmir","Ladakh","Chandigarh","Puducherry",
];
