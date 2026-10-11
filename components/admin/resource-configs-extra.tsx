"use client";
import { ResourceManager } from "@/components/admin/resource-manager";
import { Badge } from "@/components/admin/ui";
import { formatDate, formatINR } from "@/lib/utils";

const thumb = (src?: string) => (src ? <img src={src} alt="" className="h-12 w-16 border border-line object-cover" /> : <div className="h-12 w-16 bg-neutral-100" />);

export function GiftCardsAdmin() {
  return (
    <ResourceManager
      resource="giftcards" title="Gift cards" singular="Gift card"
      description="Issue gift cards (e.g. sold offline or by WhatsApp). Customers redeem the code at checkout; unused balance stays on the card."
      defaults={{ active: true }}
      fields={[
        { name: "code", label: "Code", type: "text", required: true, hint: "e.g. GIFT-AB12CD" },
        { name: "initialAmount", label: "Amount (₹)", type: "number", required: true },
        { name: "balance", label: "Current balance (₹)", type: "number", hint: "Defaults to the amount. Edit to adjust." },
        { name: "recipientEmail", label: "Recipient email (optional)", type: "text" },
        { name: "expiryDate", label: "Expiry date", type: "date" },
        { name: "note", label: "Internal note", type: "text", full: true },
        { name: "active", label: "Active", type: "switch" },
      ]}
      columns={[
        { key: "code", label: "Code", render: (r) => <span className="font-mono font-medium">{r.code}</span> },
        { key: "initialAmount", label: "Issued", render: (r) => formatINR(r.initialAmount) },
        { key: "balance", label: "Balance", render: (r) => <span className="font-medium">{formatINR(r.balance)}</span> },
        { key: "expiryDate", label: "Expires", render: (r) => (r.expiryDate ? formatDate(r.expiryDate) : "Never") },
        { key: "active", label: "Status", render: (r) => <Badge tone={r.active && r.balance > 0 ? "green" : "gray"}>{r.balance <= 0 ? "Used" : r.active ? "Active" : "Inactive"}</Badge> },
      ]}
    />
  );
}

export function JournalAdmin() {
  return (
    <ResourceManager
      resource="journal" title="Journal" singular="Post"
      description="Style notes and stories for /journal. Use a blank line between paragraphs and “## ” for headings."
      defaults={{ published: false, tags: [], author: "The Studio", coverImage: "" }}
      fields={[
        { name: "title", label: "Title", type: "text", required: true },
        { name: "slug", label: "Slug", type: "text", hint: "Leave empty to generate" },
        { name: "excerpt", label: "Excerpt", type: "text", full: true },
        { name: "coverImage", label: "Cover image", type: "image" },
        { name: "content", label: "Content", type: "textarea" },
        { name: "author", label: "Author", type: "text" },
        { name: "tags", label: "Tags", type: "tags" },
        { name: "published", label: "Published", type: "switch" },
      ]}
      columns={[
        { key: "img", label: "", render: (r) => thumb(r.coverImage) },
        { key: "title", label: "Post", render: (r) => <div><p className="font-medium">{r.title}</p><p className="text-xs text-muted">/journal/{r.slug}</p></div> },
        { key: "published", label: "Status", render: (r) => <Badge tone={r.published ? "green" : "gray"}>{r.published ? "Published" : "Draft"}</Badge> },
        { key: "publishedAt", label: "Date", render: (r) => formatDate(r.publishedAt || r.createdAt) },
      ]}
    />
  );
}

export function OffersAdmin() {
  const TYPE = { PERCENT_OFF: "% off", BUY_X_GET_Y: "Buy X get Y free", BUNDLE_PRICE: "Bundle price" } as const;
  return (
    <ResourceManager
      resource="offers" title="Offers & flash sales" singular="Offer"
      description="Automatic discounts applied in the cart — no code needed. The single best offer is applied; coupons stack on top. Flash sales show a live countdown and reduced prices across the store."
      defaults={{ type: "PERCENT_OFF", scope: "all", refs: [], minQty: 1, value: 10, flash: false, active: true }}
      fields={[
        { name: "name", label: "Internal name", type: "text", required: true },
        { name: "label", label: "Customer-facing text", type: "text", hint: "e.g. “Buy 2 tees, get 15% off”" },
        { name: "type", label: "Offer type", type: "select", options: [{ value: "PERCENT_OFF", label: "Percentage off (when buying min quantity)" }, { value: "BUY_X_GET_Y", label: "Buy X, get Y cheapest free" }, { value: "BUNDLE_PRICE", label: "Bundle: any N items for a fixed price" }] },
        { name: "minQty", label: "Quantity (X / N / minimum)", type: "number", required: true, hint: "Buy-X-get-Y: X. Bundle: N items. Percentage: minimum items." },
        { name: "value", label: "Value", type: "number", required: true, hint: "Percent (1–90) · free items Y (1–5) · bundle price in ₹" },
        { name: "scope", label: "Applies to", type: "select", resets: ["refs"], options: [{ value: "all", label: "All products" }, { value: "category", label: "Specific categories" }, { value: "collection", label: "Specific collections" }, { value: "products", label: "Specific products" }] },
        { name: "refs", label: "Pick categories / collections / products", type: "multiref", refResource: (v) => (v.scope === "collection" ? "collections" : v.scope === "products" ? "products" : "categories"), hint: "The list follows “Applies to”. Ignored when it applies to all products.", full: true },
        { name: "startDate", label: "Starts", type: "date" },
        { name: "endDate", label: "Ends", type: "date", hint: "Required for flash sales" },
        { name: "flash", label: "Flash sale (countdown + reduced prices; percentage offers only)", type: "switch" },
        { name: "active", label: "Active", type: "switch" },
      ]}
      columns={[
        { key: "name", label: "Offer", render: (r) => <div><p className="font-medium">{r.name}{r.flash && <span className="ml-2"><Badge tone="red">FLASH</Badge></span>}</p><p className="text-xs text-muted">{r.label}</p></div> },
        { key: "type", label: "Type", render: (r) => `${TYPE[r.type as keyof typeof TYPE]} · ${r.type === "PERCENT_OFF" ? `${r.value}% from ${r.minQty}` : r.type === "BUY_X_GET_Y" ? `buy ${r.minQty} get ${r.value}` : `${r.minQty} for ₹${r.value}`}` },
        { key: "scope", label: "Scope", render: (r) => `${r.scope}${r.scope !== "all" ? ` (${r.refs?.length || 0})` : ""}` },
        { key: "dates", label: "Runs", render: (r) => `${r.startDate ? formatDate(r.startDate) : "Now"} → ${r.endDate ? formatDate(r.endDate) : "Open"}` },
        { key: "active", label: "Status", render: (r) => <Badge tone={r.active ? "green" : "gray"}>{r.active ? "Active" : "Inactive"}</Badge> },
      ]}
    />
  );
}
