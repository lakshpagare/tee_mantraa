// Shared by generate-images.mjs and seed.ts — single source of truth for demo catalog data.
export const slugify = (s) => s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const COLOR_HEX = {
  Ecru: "#E9E2D3", Black: "#161616", Olive: "#6B705C", Navy: "#1F2A44", Sand: "#C8B79A", Stone: "#9A9A94",
  Indigo: "#2C3E6B", Rust: "#A5573E", "Washed Black": "#2B2B2B", Sky: "#A9C1D9", White: "#F4F2EE", Charcoal: "#3A3A3A", Cream: "#EFE8D8", Tan: "#B08A5B", "Light Wash": "#8FA8C4",
};

export const CATEGORIES = [
  { name: "New Arrivals", slug: "new-arrivals", description: "The latest drops, straight from the studio.", type: "shirt", tone: ["#E9E4DA", "#CFC8B8"] },
  { name: "Shirts", slug: "shirts", description: "Linen, oxford and flannel shirts cut for everyday.", type: "shirt", tone: ["#DDE3E8", "#B9C4CE"] },
  { name: "T-Shirts", slug: "t-shirts", description: "Heavyweight cotton tees in considered cuts.", type: "tee", tone: ["#EFE8D8", "#D8CDB2"] },
  { name: "Hoodies", slug: "hoodies", description: "Soft, structured hoodies built to last.", type: "hoodie", tone: ["#D9D6CF", "#B5B1A7"] },
  { name: "Jeans", slug: "jeans", description: "Straight, wide and tapered denim.", type: "jeans", tone: ["#CBD5E1", "#9FB0C6"] },
  { name: "Jackets", slug: "jackets", description: "Layers with presence — bombers, truckers and utility.", type: "jacket", tone: ["#D6CFC4", "#A89F8F"] },
  { name: "Trousers", slug: "trousers", description: "Pleated, tailored and relaxed trousers.", type: "trousers", tone: ["#E4DED2", "#C6BCA8"] },
  { name: "Accessories", slug: "accessories", description: "Belts, bags and caps to finish the look.", type: "bag", tone: ["#E6E2DC", "#C9C2B8"] },
];

export const COLLECTIONS = [
  { name: "New Season", slug: "new-season", description: "Fresh silhouettes for the season ahead.", tone: ["#E9E4DA", "#C9C0AC"] },
  { name: "Weekend Edit", slug: "weekend-edit", description: "Effortless pieces for every plan.", tone: ["#DDE3E8", "#A9B8C6"] },
  { name: "Essentials", slug: "essentials", description: "The foundations of a considered wardrobe.", tone: ["#EFE8D8", "#CDBF9F"] },
  { name: "Streetwear", slug: "streetwear", description: "Oversized fits and heavyweight fabrics.", tone: ["#D3D3D0", "#9B9B96"] },
  { name: "Premium Collection", slug: "premium-collection", description: "Our finest fabrics and sharpest tailoring.", tone: ["#D8D0C4", "#9E9382"] },
  { name: "Summer Edit", slug: "summer-edit", description: "Breathable linens and light layers.", tone: ["#F0E9DA", "#D9C9A6"] },
];

const TOPS = ["XS", "S", "M", "L", "XL"];
const WAIST = ["28", "30", "32", "34", "36"];
const ONE = ["One Size"];

// [name, category, gender, price, compareAt|null, type, colors[], sizes, material, fit, short, flags, collections[]]
const P = (name, category, gender, price, compareAt, type, colors, sizes, material, fit, short, flags = "", collections = []) =>
  ({ name, slug: slugify(name), category, gender, price, compareAt, type, colors, sizes, material, fit, short, flags, collections });

export const PRODUCTS = [
  P("Linen Resort Shirt", "shirts", "men", 1499, null, "shirt", ["Ecru", "Olive", "Sky"], TOPS, "100% European linen", "Relaxed fit", "A breathable camp-collar shirt in washed linen.", "NB", ["summer-edit", "weekend-edit", "new-season"]),
  P("Oxford Button-Down", "shirts", "men", 1799, null, "shirt", ["Sky", "White", "Navy"], TOPS, "100% cotton oxford", "Regular fit", "The everyday oxford, softened with a garment wash.", "B", ["essentials"]),
  P("Checked Flannel Overshirt", "shirts", "unisex", 2199, 2799, "shirt", ["Rust", "Olive", "Navy"], TOPS, "Brushed cotton flannel", "Relaxed fit", "A heavyweight flannel built for layering.", "B", ["weekend-edit", "streetwear"]),
  P("Mandarin Collar Shirt", "shirts", "men", 1399, null, "shirt", ["Ecru", "Black", "Sand"], TOPS, "Cotton-linen blend", "Slim fit", "Clean lines, no collar fuss.", "N", ["new-season", "premium-collection"]),
  P("Striped Cotton Shirt", "shirts", "women", 1299, 1599, "shirt", ["Sky", "Cream", "Navy"], TOPS, "Poplin cotton", "Relaxed fit", "A crisp, easy shirt with a fine stripe.", "", ["summer-edit"]),
  P("Essential Crew Tee", "t-shirts", "unisex", 799, null, "tee", ["White", "Black", "Stone"], TOPS, "220 GSM combed cotton", "Regular fit", "The tee you reach for every day.", "BN", ["essentials", "new-season"]),
  P("Heavyweight Boxy Tee", "t-shirts", "unisex", 999, null, "tee", ["Ecru", "Charcoal", "Olive"], TOPS, "280 GSM heavyweight cotton", "Boxy fit", "Substantial cotton with a cropped, boxy drape.", "B", ["streetwear", "essentials"]),
  P("Pocket Tee", "t-shirts", "men", 899, null, "tee", ["Sand", "Navy", "White"], TOPS, "Slub cotton jersey", "Regular fit", "A relaxed tee with a single chest pocket.", "", ["weekend-edit"]),
  P("Oversized Graphic Tee", "t-shirts", "unisex", 1199, 1499, "tee", ["Black", "Ecru", "Rust"], TOPS, "240 GSM cotton", "Oversized fit", "Quiet back graphic, loud silhouette.", "N", ["streetwear", "new-season"]),
  P("Ribbed Henley Tee", "t-shirts", "women", 1099, null, "tee", ["Cream", "Black", "Sand"], TOPS, "Ribbed cotton-modal", "Slim fit", "A soft ribbed henley with a three-button placket.", "", ["essentials"]),
  P("Core Pullover Hoodie", "hoodies", "unisex", 2499, null, "hoodie", ["Charcoal", "Ecru", "Navy"], TOPS, "420 GSM brushed fleece", "Regular fit", "Our everyday hoodie in dense, brushed fleece.", "B", ["essentials", "weekend-edit"]),
  P("Zip-Up Hoodie", "hoodies", "men", 2799, 3499, "hoodie", ["Black", "Stone", "Olive"], TOPS, "400 GSM cotton fleece", "Regular fit", "A full-zip hoodie with a clean, structured hood.", "B", ["streetwear"]),
  P("Oversized Washed Hoodie", "hoodies", "unisex", 2999, null, "hoodie", ["Washed Black", "Sand", "Rust"], TOPS, "Garment-dyed fleece", "Oversized fit", "Vintage-washed and generously cut.", "N", ["streetwear", "new-season", "premium-collection"]),
  P("Cropped Hoodie", "hoodies", "women", 2299, null, "hoodie", ["Cream", "Black", "Sky"], TOPS, "Brushed cotton fleece", "Cropped fit", "A cropped, boxy hoodie that sits at the waist.", "N", ["new-season"]),
  P("Straight Fit Jeans", "jeans", "men", 2499, null, "jeans", ["Indigo", "Washed Black", "Light Wash"], WAIST, "12oz stretch denim", "Straight fit", "A true straight leg in comfortable stretch denim.", "B", ["essentials"]),
  P("Slim Tapered Jeans", "jeans", "men", 2299, 2999, "jeans", ["Indigo", "Black", "Light Wash"], WAIST, "11oz stretch denim", "Slim tapered", "Slim through the thigh, tapered at the ankle.", "", ["weekend-edit"]),
  P("Wide-Leg Jeans", "jeans", "women", 2799, null, "jeans", ["Light Wash", "Indigo", "Washed Black"], WAIST, "13oz rigid denim", "Wide leg", "High-rise, wide-leg denim with weight and drape.", "BN", ["new-season", "streetwear"]),
  P("Relaxed Carpenter Jeans", "jeans", "unisex", 2699, null, "jeans", ["Tan", "Indigo", "Charcoal"], WAIST, "Cotton twill denim", "Relaxed fit", "Utility pockets and a roomy leg.", "", ["streetwear"]),
  P("Utility Overshirt Jacket", "jackets", "men", 3999, null, "jacket", ["Olive", "Sand", "Black"], TOPS, "Cotton canvas", "Regular fit", "A four-pocket overshirt that works as a light jacket.", "B", ["premium-collection", "weekend-edit"]),
  P("Bomber Jacket", "jackets", "men", 4499, 5499, "jacket", ["Black", "Olive", "Navy"], TOPS, "Water-repellent nylon", "Regular fit", "A clean, minimal bomber with ribbed trims.", "B", ["premium-collection", "streetwear"]),
  P("Denim Trucker Jacket", "jackets", "unisex", 3499, null, "jacket", ["Indigo", "Light Wash", "Washed Black"], TOPS, "12oz rigid denim", "Regular fit", "The classic trucker, in denim that ages well.", "N", ["new-season", "essentials"]),
  P("Quilted Liner Jacket", "jackets", "women", 3799, null, "jacket", ["Cream", "Black", "Sand"], TOPS, "Recycled-fill quilted shell", "Relaxed fit", "Light warmth in a quilted, collarless cut.", "", ["premium-collection"]),
  P("Pleated Chinos", "trousers", "men", 1999, null, "trousers", ["Sand", "Olive", "Navy"], WAIST, "Cotton twill", "Relaxed tapered", "Single-pleat chinos with a relaxed seat.", "B", ["essentials", "weekend-edit"]),
  P("Tailored Wool-Blend Trousers", "trousers", "men", 2999, null, "trousers", ["Charcoal", "Navy", "Stone"], WAIST, "Wool-blend suiting", "Tailored fit", "Sharp, drapey trousers for work and beyond.", "N", ["premium-collection"]),
  P("Drawstring Linen Trousers", "trousers", "women", 1799, 2299, "trousers", ["Ecru", "Olive", "Sky"], WAIST, "100% linen", "Relaxed fit", "Breezy linen trousers with an easy drawstring waist.", "B", ["summer-edit"]),
  P("Cargo Trousers", "trousers", "unisex", 2199, null, "trousers", ["Olive", "Black", "Sand"], WAIST, "Ripstop cotton", "Relaxed fit", "Roomy cargos with articulated knees.", "", ["streetwear"]),
  P("Leather Belt", "accessories", "unisex", 999, null, "bag", ["Black", "Tan"], ["S", "M", "L"], "Full-grain leather", "Standard", "A full-grain leather belt with a brushed buckle.", "", ["essentials"]),
  P("Canvas Tote", "accessories", "unisex", 1299, null, "bag", ["Ecru", "Black"], ONE, "Heavy cotton canvas", "One size", "A roomy everyday tote with an inner pocket.", "BN", ["weekend-edit", "summer-edit"]),
  P("Wool Beanie", "accessories", "unisex", 799, null, "bag", ["Charcoal", "Cream", "Rust"], ONE, "Merino wool blend", "One size", "A soft ribbed beanie in a merino blend.", "", ["streetwear"]),
  P("Minimal Cap", "accessories", "unisex", 899, 1199, "bag", ["Navy", "Stone", "Black"], ONE, "Washed cotton twill", "One size", "A six-panel cap with an adjustable strap.", "", ["weekend-edit"]),
];
