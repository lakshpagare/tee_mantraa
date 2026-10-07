// Generates original SVG placeholder artwork so the store never has broken images.
// Replace any file in /public/images (or upload via Admin → Cloudinary) with real photography.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CATEGORIES, COLLECTIONS, COLOR_HEX, PRODUCTS } from "./catalog.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "images");
const write = (rel, svg) => { const f = path.join(root, rel); mkdirSync(path.dirname(f), { recursive: true }); writeFileSync(f, svg); };

const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };
const shade = (hex, amt) => { const n = parseInt(hex.slice(1), 16); const c = (v) => Math.max(0, Math.min(255, v + amt)); return "#" + [c(n >> 16), c((n >> 8) & 255), c(n & 255)].map((v) => v.toString(16).padStart(2, "0")).join(""); };

// Garment silhouettes in a 400x500 box.
const SHAPES = {
  tee: `<path d="M140 90 L80 120 L50 190 L95 210 L120 170 L120 400 L280 400 L280 170 L305 210 L350 190 L320 120 L260 90 Q200 135 140 90Z"/>`,
  shirt: `<path d="M145 85 L75 120 L40 330 L80 340 L120 200 L120 410 L280 410 L280 200 L320 340 L360 330 L325 120 L255 85 L200 125Z"/><path d="M145 85 L200 145 L255 85 M200 145 L200 410" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="3"/>`,
  hoodie: `<path d="M145 95 L70 125 L40 340 L85 350 L120 210 L120 410 L280 410 L280 210 L315 350 L360 340 L330 125 L255 95 Q200 140 145 95Z"/><path d="M150 95 Q200 10 250 95 Q200 125 150 95Z" opacity=".8"/><path d="M150 320 L250 320 L268 375 L132 375Z" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="3"/>`,
  jacket: `<path d="M145 85 L70 120 L38 340 L82 350 L120 200 L120 420 L280 420 L280 200 L318 350 L362 340 L330 120 L255 85 L200 130Z"/><path d="M145 85 L200 135 L255 85 M200 135 L200 420 M150 330 L190 330 M210 330 L250 330" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="3"/>`,
  jeans: `<path d="M135 70 L265 70 L288 445 L215 445 L200 195 L185 445 L112 445Z"/><path d="M135 96 L265 96 M200 96 L200 195" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="3"/>`,
  trousers: `<path d="M140 70 L260 70 L278 445 L210 445 L200 205 L190 445 L122 445Z"/><path d="M140 94 L260 94 M162 94 L156 440 M238 94 L244 440" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="3"/>`,
  bag: `<path d="M105 215 L295 215 L310 430 L90 430Z"/><path d="M150 215 Q150 110 200 110 Q250 110 250 215" fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round"/>`,
};

function svg(w, h, { tones, garment = "#2b2b2b", type, variant = 0, label = "", sub = "", scale = 0.62, shapeOnly = false }) {
  const [a, b] = tones;
  const cx = w / 2, cy = h / 2;
  const s = Math.min(w / 400, h / 500) * scale;
  const tx = cx - 200 * s + (variant ? w * 0.04 : 0), ty = cy - 250 * s + h * 0.02;
  const arch = variant ? `<circle cx="${w * 0.72}" cy="${h * 0.3}" r="${Math.min(w, h) * 0.22}" fill="${shade(a, -14)}" opacity=".55"/>` : `<path d="M${w * 0.18} ${h * 0.92} V${h * 0.42} A${w * 0.32} ${w * 0.32} 0 0 1 ${w * 0.82} ${h * 0.42} V${h * 0.92}Z" fill="${shade(a, -12)}" opacity=".5"/>`;
  const art = type && SHAPES[type] ? `<g transform="translate(${tx} ${ty}) scale(${s}) ${variant ? `rotate(-4 200 250)` : ""}" fill="${garment}" color="${garment}" filter="url(#sh)">${SHAPES[type]}</g>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label || "VÉRANO"}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient><filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="${12 * s}" stdDeviation="${14 * s}" flood-color="#000" flood-opacity=".22"/></filter></defs>
<rect width="${w}" height="${h}" fill="url(#g)"/>${arch}${art}
${label ? `<text x="${w * 0.07}" y="${h * 0.93}" font-family="Georgia, 'Times New Roman', serif" font-size="${Math.max(18, w * 0.034)}" fill="#111" opacity=".8" letter-spacing="3">${label.toUpperCase()}</text>` : ""}
${sub ? `<text x="${w * 0.07}" y="${h * 0.93 - Math.max(24, w * 0.045)}" font-family="Georgia, serif" font-style="italic" font-size="${Math.max(14, w * 0.026)}" fill="#111" opacity=".55">${sub}</text>` : ""}
</svg>`;
}

const LIGHT = [["#EDE9E1", "#D5CEC0"], ["#E3E7EA", "#BFC9D2"], ["#EFE7D6", "#D9CDB0"], ["#E5E1DA", "#C3BCAF"]];
const DARK = [["#3A3A38", "#1F1F1E"], ["#47474A", "#262628"], ["#40392F", "#211D17"]];

// Products (4:5)
PRODUCTS.forEach((p, i) => {
  [0, 1].forEach((v) => {
    const hex = COLOR_HEX[p.colors[v % p.colors.length]];
    const pool = lum(hex) > 0.55 ? DARK : LIGHT;
    write(`products/${p.slug}-${v + 1}.svg`, svg(800, 1000, { tones: pool[(i + v) % pool.length], garment: hex, type: p.type, variant: v, label: "VÉRANO", sub: p.name, scale: v ? 0.7 : 0.62 }));
  });
});
write("products/placeholder.svg", svg(800, 1000, { tones: LIGHT[0], label: "VÉRANO" }));

// Categories (4:5)
CATEGORIES.forEach((c, i) => write(`categories/${c.slug}.svg`, svg(800, 1000, { tones: c.tone, garment: ["#2B2B2B", "#6B705C", "#3A4A6B", "#7A5C3E"][i % 4], type: c.type, variant: i % 2, label: c.name, scale: 0.7 })));

// Collections (4:3)
COLLECTIONS.forEach((c, i) => write(`collections/${c.slug}.svg`, svg(1200, 900, { tones: c.tone, garment: ["#2B2B2B", "#6B705C", "#3A4A6B"][i % 3], type: ["shirt", "tee", "hoodie", "jacket", "trousers", "shirt"][i], variant: i % 2, label: c.name, scale: 0.75 })));

// Hero, editorial, banners, social
write("hero/hero.svg", svg(2000, 1250, { tones: ["#CFC8B8", "#8E8574"], garment: "#1b1b1b", type: "jacket", variant: 1, label: "The Art of Everyday", scale: 0.78 }));
write("editorial/e1.svg", svg(800, 1000, { tones: ["#E9E4DA", "#BDB4A0"], garment: "#2B2B2B", type: "shirt", scale: 0.72, label: "The New Standard" }));
write("editorial/e2.svg", svg(800, 1067, { tones: ["#DDE3E8", "#A9B8C6"], garment: "#3A4A6B", type: "jeans", variant: 1, scale: 0.7 }));
write("editorial/e3.svg", svg(800, 1067, { tones: ["#EFE8D8", "#CDBF9F"], garment: "#6B705C", type: "tee", scale: 0.7 }));
write("editorial/collection.svg", svg(1920, 1080, { tones: ["#D6CFC4", "#7E7566"], garment: "#2a2a2a", type: "hoodie", variant: 1, label: "The Weekend Edit", scale: 0.8 }));
write("editorial/story.svg", svg(800, 1000, { tones: ["#E4DED2", "#B9AE98"], garment: "#2B2B2B", type: "trousers", variant: 1, scale: 0.72, label: "Our Story" }));
write("banners/promo.svg", svg(1600, 600, { tones: ["#2b2b2b", "#111"], garment: "#e8e2d4", type: "jacket", scale: 0.8 }));
const socialTypes = ["tee", "hoodie", "shirt", "jeans", "jacket", "trousers", "bag", "tee"];
for (let i = 0; i < 8; i++) write(`social/s${i + 1}.svg`, svg(800, 800, { tones: (i % 2 ? DARK : LIGHT)[i % 3], garment: i % 2 ? "#e8e2d4" : "#2B2B2B", type: socialTypes[i], variant: i % 2, scale: 0.74 }));

console.log(`Generated placeholder artwork in ${root}`);
