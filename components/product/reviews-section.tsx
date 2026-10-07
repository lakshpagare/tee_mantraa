"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { BadgeCheck, MessageSquareText, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Img } from "@/components/ui/img";
import { Stars } from "@/components/ui/stars";
import { cn, formatDate } from "@/lib/utils";
import type { ReviewDTO } from "@/types";

export function ReviewsSection({ productId, rating, count, reviews, breakdown }: { productId: string; rating: number; count: number; reviews: ReviewDTO[]; breakdown: number[] }) {
  const { data: session } = useSession();
  const [stars, setStars] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [image, setImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setImage(d.url);
    } catch (e: any) {
      toast.error(e.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stars) return toast.error("Please choose a star rating");
    setBusy(true);
    try {
      const r = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, rating: stars, title, comment, image }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setDone(d.status === "APPROVED" ? "Thank you! Your verified review is now live." : "Thank you! Your review will appear once it has been approved.");
    } catch (err: any) {
      toast.error(err.message || "Could not submit your review");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="reviews" aria-labelledby="reviews-h" className="section-y border-t border-line">
      <div className="container-wide grid gap-14 lg:grid-cols-[320px_1fr]">
        <div>
          <h2 id="reviews-h" className="display text-4xl md:text-5xl">Reviews</h2>
          {count > 0 ? (
            <div className="mt-6">
              <p className="font-display text-6xl">{rating.toFixed(1)}</p>
              <Stars value={rating} size={16} className="mt-1" />
              <p className="mt-1 text-sm text-muted">{count} review{count > 1 ? "s" : ""}</p>
              <ul className="mt-6 space-y-2">
                {[5, 4, 3, 2, 1].map((n) => (
                  <li key={n} className="flex items-center gap-3 text-xs">
                    <span className="w-6">{n}★</span>
                    <span className="h-1 flex-1 bg-line"><span className="block h-full bg-ink" style={{ width: `${count ? (breakdown[n - 1] / count) * 100 : 0}%` }} /></span>
                    <span className="w-6 text-right text-muted">{breakdown[n - 1]}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-10 border-t border-line pt-8">
            <h3 className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em]">Write a review</h3>
            {!session?.user ? (
              <p className="text-sm text-muted"><Link href={`/login?callbackUrl=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`} className="underline">Sign in</Link> to share your thoughts.</p>
            ) : done ? (
              <p role="status" className="text-sm">{done}</p>
            ) : (
              <form onSubmit={submit} className="space-y-4" noValidate>
                <div role="radiogroup" aria-label="Rating" className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" role="radio" aria-checked={stars === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setStars(n)}>
                      <Star className={cn("h-7 w-7 transition-colors", n <= stars ? "fill-ink text-ink" : "text-line hover:text-muted")} />
                    </button>
                  ))}
                </div>
                <Field label="Title (optional)"><Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} /></Field>
                <Field label="Your review"><Textarea value={comment} onChange={(e) => setComment(e.target.value)} minLength={10} maxLength={2000} required /></Field>
                <div>
                  <label className="inline-block cursor-pointer text-xs underline">
                    {uploading ? "Uploading…" : image ? "Replace photo" : "Add a photo (optional)"}
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                  </label>
                  {image && <div className="mt-2 w-20"><Img src={image} alt="Your upload" ratio="1/1" sizes="80px" /></div>}
                </div>
                <Button type="submit" loading={busy}>Submit review</Button>
              </form>
            )}
          </div>
        </div>

        <div>
          {reviews.length === 0 ? (
            <EmptyState icon={MessageSquareText} title="No reviews yet" text="Be the first to share what you think of this piece." />
          ) : (
            <ul className="divide-y divide-line">
              {reviews.map((r) => (
                <li key={r._id} className="py-8 first:pt-0">
                  <div className="flex items-center justify-between"><Stars value={r.rating} /><time className="text-xs text-muted" dateTime={r.createdAt}>{formatDate(r.createdAt)}</time></div>
                  {r.title && <p className="mt-3 font-medium">{r.title}</p>}
                  <p className="mt-2 text-sm leading-relaxed text-muted">{r.comment}</p>
                  {r.image && <div className="mt-3 w-24"><Img src={r.image} alt="Customer photo" ratio="1/1" sizes="96px" /></div>}
                  <p className="mt-3 flex items-center gap-2 text-xs"><span className="font-medium">{r.name}</span>{r.verified && <span className="flex items-center gap-1 text-muted"><BadgeCheck className="h-3.5 w-3.5" />Verified purchase</span>}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
