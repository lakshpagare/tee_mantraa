/** Tracking URL templates. Add your courier here; {n} is replaced with the tracking number. */
const TEMPLATES: Record<string, string> = {
  Delhivery: "https://www.delhivery.com/track/package/{n}",
  "Blue Dart": "https://www.bluedart.com/tracking?trackfor={n}",
  DTDC: "https://www.dtdc.in/tracking/shipment-tracking.asp?strCnno={n}",
  "India Post": "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?id={n}",
  Shiprocket: "https://shiprocket.co/tracking/{n}",
};
export const trackingUrl = (carrier?: string, n?: string) => (carrier && n && TEMPLATES[carrier] ? TEMPLATES[carrier].replace("{n}", encodeURIComponent(n)) : null);
