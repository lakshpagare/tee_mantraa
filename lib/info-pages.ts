export interface InfoPage { title: string; eyebrow: string; intro: string; sections: { heading: string; body: string }[] }

export const INFO_PAGES: Record<string, InfoPage> = {
  about: {
    title: "About", eyebrow: "The brand",
    intro: "VÉRANO makes considered everyday clothing — clean silhouettes, honest fabrics and details that last.",
    sections: [
      { heading: "What we do", body: "We design shirts, tees, hoodies, jeans, jackets and accessories for modern life: pieces that move easily from a workday to a weekend plan without trying too hard." },
      { heading: "How we work", body: "Small, focused collections. Fabrics chosen for hand-feel and longevity. Fits tested on real people. We would rather release fewer pieces and get each one right." },
    ],
  },
  "our-story": {
    title: "Our Story", eyebrow: "Built around your style",
    intro: "It started with a simple frustration: great basics were either forgettable or overpriced.",
    sections: [
      { heading: "The idea", body: "We set out to make clothes with the restraint of luxury and the ease of everyday wear — defined by style, not by logos." },
      { heading: "The promise", body: "Thoughtfully designed clothing made for modern everyday life. If something doesn't feel right, our 7-day returns make it easy to put right." },
    ],
  },
  careers: {
    title: "Careers", eyebrow: "Join us",
    intro: "We're a small team that cares about craft. There are no open roles right now, but we love hearing from talented people.",
    sections: [{ heading: "Get in touch", body: "Send a short note and your portfolio or CV to the contact email in the footer. We keep every application on file and reach out when a role opens." }],
  },
  contact: {
    title: "Contact", eyebrow: "We're here to help",
    intro: "Questions about an order, a fit or a return? Write to us and we'll reply within one business day.",
    sections: [
      { heading: "Email & phone", body: "Use the email and phone number shown at the bottom of every page. Support hours: Monday to Saturday, 10am – 7pm IST." },
      { heading: "Order queries", body: "Please include your order number (it starts with VR-) so we can help faster." },
    ],
  },
  shipping: {
    title: "Shipping", eyebrow: "Delivery information",
    intro: "We ship across India. Orders above the free-shipping threshold ship free.",
    sections: [
      { heading: "Delivery times", body: "Standard delivery takes 3–7 business days. Express delivery takes 1–3 business days. Orders are dispatched within 24–48 hours." },
      { heading: "Charges", body: "Standard shipping is free above the threshold shown in the announcement bar; otherwise a flat fee applies. Express carries a flat fee. Exact charges appear at checkout." },
      { heading: "Tracking", body: "Track every order from your account. Once shipped, the tracking number appears on your order page." },
    ],
  },
  returns: {
    title: "Returns", eyebrow: "Easy returns",
    intro: "Not quite right? Return unworn items within 7 days of delivery.",
    sections: [
      { heading: "How to return", body: "Contact us with your order number. We'll arrange a pickup or share return instructions. Items must be unworn, unwashed and carry original tags." },
      { heading: "Exchanges", body: "Need a different size? Place a new order and return the original — this is the fastest way to get your size." },
      { heading: "Non-returnable items", body: "For hygiene reasons, accessories such as caps and beanies are final sale unless faulty." },
    ],
  },
  "refund-policy": {
    title: "Refund Policy", eyebrow: "Legal",
    intro: "Refunds are issued to the original payment method after we receive and inspect the return.",
    sections: [
      { heading: "Timeline", body: "Refunds are processed within 5–7 business days of the return reaching us. Your bank may take a few additional days to show the credit." },
      { heading: "Cash on Delivery", body: "For COD orders, refunds are made by bank transfer. We'll ask for your account details securely." },
    ],
  },
  "privacy-policy": {
    title: "Privacy Policy", eyebrow: "Legal",
    intro: "We collect only what we need to process your orders and improve your experience.",
    sections: [
      { heading: "What we collect", body: "Account details, delivery addresses, order history and basic usage data. Card details are handled by our payment provider and never stored on our servers." },
      { heading: "How we use it", body: "To fulfil orders, provide support, and — if you subscribe — send news and offers. You can unsubscribe at any time." },
      { heading: "Your rights", body: "You can access, correct or delete your data by contacting us. Replace this placeholder text with your legally reviewed policy before launch." },
    ],
  },
  terms: {
    title: "Terms & Conditions", eyebrow: "Legal",
    intro: "By using this site you agree to the terms below.",
    sections: [
      { heading: "Orders & pricing", body: "All prices are in Indian Rupees and include applicable GST. We reserve the right to cancel orders affected by pricing or stock errors and will refund any payment received." },
      { heading: "Use of the site", body: "Content is owned by the brand. Please don't misuse the site or attempt unauthorised access. Replace this placeholder text with your legally reviewed terms before launch." },
    ],
  },
  "size-guide": {
    title: "Size Guide", eyebrow: "Find your fit",
    intro: "Measurements are body measurements in inches. If you are between sizes, size up for a relaxed fit.",
    sections: [
      { heading: "Tops (shirts, tees, hoodies, jackets)", body: "XS: chest 34 · S: 36 · M: 38 · L: 40 · XL: 42 · XXL: 44" },
      { heading: "Bottoms (jeans, trousers)", body: "Sized by waist in inches: 28 · 30 · 32 · 34 · 36. Each product page lists its fit (slim, straight, relaxed)." },
      { heading: "How to measure", body: "Chest: around the fullest part, under the arms. Waist: around the narrowest part of your natural waistline. Keep the tape snug but not tight." },
    ],
  },
};

export const FAQS = [
  ["How long does delivery take?", "Standard delivery takes 3–7 business days; express takes 1–3 business days."],
  ["Is Cash on Delivery available?", "Yes, COD is available on all serviceable pincodes."],
  ["How do I return an item?", "Contact us within 7 days of delivery with your order number and we'll arrange the return."],
  ["Can I change or cancel my order?", "Contact us as soon as possible. Orders can be changed or cancelled before they are shipped."],
  ["How do I track my order?", "Open your account, go to Orders and choose Track order."],
] as const;
