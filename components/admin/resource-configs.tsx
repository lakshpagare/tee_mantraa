"use client";
import { Check, Download, Star, X } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/api";
import { ResourceManager, type FieldDef } from "@/components/admin/resource-manager";
import { Badge, statusTone } from "@/components/admin/ui";
import { formatDate, formatINR } from "@/lib/utils";

const thumb = (src?: string) => (src ? <img src={src} alt="" className="h-12 w-10 border border-line object-cover" /> : <div className="h-12 w-10 bg-neutral-100" />);
const yesNo = (v: boolean) => <Badge tone={v ? "green" : "gray"}>{v ? "Yes" : "No"}</Badge>;

const PRODUCT_FIELDS: FieldDef[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text", hint: "Leave empty to generate from the name" },
  { name: "shortDescription", label: "Short description", type: "text", full: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "price", label: "Price (₹)", type: "number", required: true },
  { name: "compareAtPrice", label: "Compare-at price (₹)", type: "number", hint: "Shown struck-through to display a discount" },
  { name: "costPrice", label: "Cost price (₹)", type: "number" },
  { name: "sku", label: "SKU", type: "text", required: true },
  { name: "category", label: "Category", type: "refselect", refResource: "categories" },
  { name: "subcategory", label: "Subcategory", type: "text" },
  { name: "brand", label: "Brand", type: "text" },
  { name: "gender", label: "Gender", type: "select", options: [{ value: "unisex", label: "Unisex" }, { value: "men", label: "Men" }, { value: "women", label: "Women" }] },
  { name: "stock", label: "Stock", type: "number", required: true },
  { name: "lowStockThreshold", label: "Low stock threshold", type: "number" },
  { name: "material", label: "Material", type: "text" },
  { name: "fit", label: "Fit", type: "text" },
  { name: "images", label: "Images (drag to reorder)", type: "images" },
  { name: "colors", label: "Colours", type: "colors" },
  { name: "sizes", label: "Sizes", type: "tags", hint: "e.g. S, M, L — or 28, 30, 32 — or One Size" },
  { name: "tags", label: "Tags", type: "tags" },
  { name: "featured", label: "Featured", type: "switch" },
  { name: "bestSeller", label: "Best seller", type: "switch" },
  { name: "newArrival", label: "New arrival", type: "switch" },
  { name: "published", label: "Published", type: "switch" },
];

export function ProductsAdmin() {
  return (
    <ResourceManager
      resource="products" title="Products" singular="Product"
      defaults={{ images: [], colors: [], sizes: [], tags: [], gender: "unisex", brand: "VÉRANO", stock: 0, lowStockThreshold: 5, published: true, featured: false, bestSeller: false, newArrival: false }}
      fields={PRODUCT_FIELDS}
      columns={[
        { key: "img", label: "", render: (r) => thumb(r.images?.[0]) },
        { key: "name", label: "Product", render: (r) => <div><p className="font-medium">{r.name}</p><p className="text-xs text-muted">{r.sku}</p></div> },
        { key: "category", label: "Category", render: (r) => r.category?.name || "—" },
        { key: "price", label: "Price", render: (r) => formatINR(r.price) },
        { key: "stock", label: "Stock", render: (r) => <span className={r.stock - r.reserved <= r.lowStockThreshold ? "font-medium text-amber-600" : ""}>{r.stock}</span> },
        { key: "published", label: "Status", render: (r) => <Badge tone={r.published ? "green" : "gray"}>{r.published ? "Published" : "Draft"}</Badge> },
      ]}
    />
  );
}

export function CategoriesAdmin() {
  return (
    <ResourceManager
      resource="categories" title="Categories" singular="Category"
      defaults={{ active: true, sortOrder: 0, image: "", banner: "" }}
      fields={[
        { name: "name", label: "Name", type: "text", required: true },
        { name: "slug", label: "Slug", type: "text", hint: "Leave empty to generate" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "image", label: "Image", type: "image" },
        { name: "banner", label: "Banner", type: "image" },
        { name: "sortOrder", label: "Sort order", type: "number" },
        { name: "active", label: "Active", type: "switch" },
      ]}
      columns={[
        { key: "img", label: "", render: (r) => thumb(r.image) },
        { key: "name", label: "Name", render: (r) => <div><p className="font-medium">{r.name}</p><p className="text-xs text-muted">/{r.slug}</p></div> },
        { key: "sortOrder", label: "Order" },
        { key: "active", label: "Active", render: (r) => yesNo(r.active) },
      ]}
    />
  );
}

export function CollectionsAdmin() {
  return (
    <ResourceManager
      resource="collections" title="Collections" singular="Collection"
      description="Group products into edits like New Season, Weekend Edit or Essentials."
      defaults={{ active: true, sortOrder: 0, image: "", products: [] }}
      fields={[
        { name: "name", label: "Name", type: "text", required: true },
        { name: "slug", label: "Slug", type: "text" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "image", label: "Image", type: "image" },
        { name: "products", label: "Products in this collection", type: "multiref", refResource: "products" },
        { name: "sortOrder", label: "Sort order", type: "number" },
        { name: "active", label: "Active", type: "switch" },
      ]}
      columns={[
        { key: "img", label: "", render: (r) => thumb(r.image) },
        { key: "name", label: "Name", render: (r) => <div><p className="font-medium">{r.name}</p><p className="text-xs text-muted">/collections/{r.slug}</p></div> },
        { key: "n", label: "Products", render: (r) => r.products?.length || 0 },
        { key: "active", label: "Active", render: (r) => yesNo(r.active) },
      ]}
    />
  );
}

export function CouponsAdmin() {
  return (
    <ResourceManager
      resource="coupons" title="Coupons" singular="Coupon"
      defaults={{ type: "PERCENT", value: 10, minOrder: 0, perUserLimit: 1, active: true }}
      fields={[
        { name: "code", label: "Coupon code", type: "text", required: true },
        { name: "description", label: "Description", type: "text" },
        { name: "type", label: "Discount type", type: "select", options: [{ value: "PERCENT", label: "Percentage" }, { value: "FIXED", label: "Fixed amount (₹)" }] },
        { name: "value", label: "Value", type: "number", required: true, hint: "Percent (1–100) or rupees" },
        { name: "minOrder", label: "Minimum order (₹)", type: "number" },
        { name: "maxDiscount", label: "Maximum discount (₹)", type: "number" },
        { name: "usageLimit", label: "Total usage limit", type: "number" },
        { name: "perUserLimit", label: "Per-user limit", type: "number" },
        { name: "startDate", label: "Start date", type: "date" },
        { name: "expiryDate", label: "Expiry date", type: "date" },
        { name: "active", label: "Active", type: "switch" },
      ]}
      columns={[
        { key: "code", label: "Code", render: (r) => <span className="font-mono font-medium">{r.code}</span> },
        { key: "value", label: "Discount", render: (r) => (r.type === "PERCENT" ? `${r.value}%` : formatINR(r.value)) },
        { key: "minOrder", label: "Min order", render: (r) => formatINR(r.minOrder || 0) },
        { key: "used", label: "Used", render: (r) => `${r.usedCount}${r.usageLimit ? ` / ${r.usageLimit}` : ""}` },
        { key: "expiryDate", label: "Expires", render: (r) => (r.expiryDate ? formatDate(r.expiryDate) : "Never") },
        { key: "active", label: "Status", render: (r) => <Badge tone={r.active ? "green" : "gray"}>{r.active ? "Active" : "Inactive"}</Badge> },
      ]}
    />
  );
}

export function BannersAdmin() {
  return (
    <ResourceManager
      resource="banners" title="Banners" singular="Banner"
      description="The newest active banner replaces the homepage promotional banner while its dates are valid."
      defaults={{ active: true, image: "" }}
      fields={[
        { name: "title", label: "Title", type: "text", required: true },
        { name: "subtitle", label: "Subtitle", type: "text" },
        { name: "image", label: "Image", type: "image" },
        { name: "ctaText", label: "CTA text", type: "text" },
        { name: "ctaLink", label: "CTA link", type: "text", hint: "e.g. /shop?sale=1" },
        { name: "startDate", label: "Start date", type: "date" },
        { name: "endDate", label: "End date", type: "date" },
        { name: "active", label: "Active", type: "switch" },
      ]}
      columns={[
        { key: "title", label: "Banner", render: (r) => <div><p className="font-medium">{r.title}</p><p className="text-xs text-muted">{r.subtitle}</p></div> },
        { key: "cta", label: "CTA", render: (r) => r.ctaText || "—" },
        { key: "dates", label: "Runs", render: (r) => `${r.startDate ? formatDate(r.startDate) : "Now"} → ${r.endDate ? formatDate(r.endDate) : "Open"}` },
        { key: "active", label: "Active", render: (r) => yesNo(r.active) },
      ]}
    />
  );
}

export function TestimonialsAdmin() {
  return (
    <ResourceManager
      resource="testimonials" title="Testimonials" singular="Testimonial"
      defaults={{ rating: 5, verified: true, active: true, sortOrder: 0 }}
      fields={[
        { name: "name", label: "Customer name", type: "text", required: true },
        { name: "product", label: "Product", type: "text" },
        { name: "rating", label: "Rating (1–5)", type: "number", required: true },
        { name: "sortOrder", label: "Sort order", type: "number" },
        { name: "text", label: "Review", type: "textarea" },
        { name: "verified", label: "Verified purchase", type: "switch" },
        { name: "active", label: "Active", type: "switch" },
      ]}
      columns={[
        { key: "name", label: "Customer", render: (r) => <div><p className="font-medium">{r.name}</p><p className="text-xs text-muted">{r.product}</p></div> },
        { key: "rating", label: "Rating", render: (r) => `${r.rating} ★` },
        { key: "text", label: "Review", render: (r) => <p className="line-clamp-2 max-w-md">{r.text}</p> },
        { key: "active", label: "Active", render: (r) => yesNo(r.active) },
      ]}
    />
  );
}

export function ReviewsAdmin() {
  const act = async (row: any, patch: object, reload: () => void, msg: string) => {
    try { await adminFetch(`/api/admin/reviews/${row._id}`, "PUT", patch); toast.success(msg); reload(); } catch (e: any) { toast.error(e.message); }
  };
  return (
    <ResourceManager
      resource="reviews" title="Reviews" singular="Review" canCreate={false} fields={[]}
      statusFilter={[{ value: "PENDING", label: "Pending" }, { value: "APPROVED", label: "Approved" }, { value: "REJECTED", label: "Rejected" }]}
      columns={[
        { key: "product", label: "Product", render: (r) => r.product?.name || "—" },
        { key: "rating", label: "Rating", render: (r) => `${r.rating} ★` },
        { key: "comment", label: "Review", render: (r) => <div className="max-w-md"><p className="line-clamp-2">{r.comment}</p><p className="mt-1 text-xs text-muted">{r.name} · {formatDate(r.createdAt)}{r.verified ? " · Verified" : ""}</p></div> },
        { key: "status", label: "Status", render: (r) => <div className="flex gap-1"><Badge tone={statusTone(r.status)}>{r.status}</Badge>{r.featured && <Badge tone="blue">Featured</Badge>}</div> },
      ]}
      rowActions={(r, reload) => (
        <>
          <button title="Approve" aria-label="Approve" onClick={() => act(r, { status: "APPROVED" }, reload, "Review approved")} className="p-2 text-green-700 hover:bg-green-50"><Check className="h-4 w-4" /></button>
          <button title="Reject" aria-label="Reject" onClick={() => act(r, { status: "REJECTED" }, reload, "Review rejected")} className="p-2 text-amber-700 hover:bg-amber-50"><X className="h-4 w-4" /></button>
          <button title="Feature" aria-label="Toggle featured" onClick={() => act(r, { featured: !r.featured }, reload, r.featured ? "Unfeatured" : "Featured")} className="p-2 hover:bg-neutral-100"><Star className={`h-4 w-4 ${r.featured ? "fill-ink" : ""}`} /></button>
        </>
      )}
    />
  );
}

export function NewsletterAdmin() {
  const exportCsv = (items: any[]) => (
    <button key="csv" className="flex h-10 items-center gap-2 border border-line bg-white px-4 text-sm hover:bg-neutral-50" onClick={() => {
      const csv = "email,subscribed,date\n" + items.map((i) => `${i.email},${i.active},${new Date(i.createdAt).toISOString()}`).join("\n");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      a.download = "subscribers.csv";
      a.click();
    }}><Download className="h-4 w-4" />Export page</button>
  );
  return (
    <ResourceManager
      resource="newsletter" title="Newsletter" singular="Subscriber" canCreate={false} fields={[]} toolbarExtra={exportCsv}
      columns={[
        { key: "email", label: "Email", render: (r) => <span className="font-medium">{r.email}</span> },
        { key: "createdAt", label: "Subscribed", render: (r) => formatDate(r.createdAt) },
        { key: "active", label: "Status", render: (r) => <Badge tone={r.active ? "green" : "gray"}>{r.active ? "Subscribed" : "Unsubscribed"}</Badge> },
      ]}
      rowActions={(r, reload) => (
        <button className="px-2 py-1 text-xs underline" onClick={async () => { try { await adminFetch(`/api/admin/newsletter/${r._id}`, "PUT", { active: !r.active }); reload(); } catch (e: any) { toast.error(e.message); } }}>{r.active ? "Unsubscribe" : "Resubscribe"}</button>
      )}
    />
  );
}
