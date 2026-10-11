"use client";
import { MessageCircle } from "lucide-react";
import { useSite } from "@/hooks/use-site";

/** Click-to-chat button. Appears only when a WhatsApp number is set in Admin → Settings. */
export function WhatsAppButton() {
  const { whatsapp, brandName } = useSite();
  const num = (whatsapp || "").replace(/\D/g, "");
  if (num.length < 8) return null;
  return (
    <a href={`https://wa.me/${num}?text=${encodeURIComponent(`Hi ${brandName}, I have a question.`)}`} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp"
      className="fixed bottom-[9.5rem] right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 lg:bottom-24 lg:right-8">
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
