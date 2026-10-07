import Image from "next/image";
import { cn } from "@/lib/utils";

// 1x1 warm-grey pixel used as blur placeholder for raster images.
const BLUR =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjUiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjUiIGZpbGw9IiNlZWVjZTYiLz48L3N2Zz4=";

const OPTIMIZABLE = /^(\/|https:\/\/(res\.cloudinary\.com|lh3\.googleusercontent\.com))/;

interface Props {
  src: string;
  alt: string;
  /** CSS aspect ratio like "4/5". Omit when the parent already has a fixed size (fill mode). */
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
}

/** Consistent image: object-cover, lazy by default, blur placeholder, graceful for SVG/remote. */
export function Img({ src, alt, ratio, sizes = "(max-width: 768px) 100vw, 50vw", priority, className, imgClassName }: Props) {
  const isSvg = src.endsWith(".svg");
  const unoptimized = isSvg || !OPTIMIZABLE.test(src);
  return (
    <div className={cn("relative overflow-hidden bg-soft", className)} style={ratio ? { aspectRatio: ratio } : undefined}>
      <Image
        src={src || "/images/products/placeholder.svg"}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={unoptimized}
        placeholder={unoptimized ? "empty" : "blur"}
        blurDataURL={unoptimized ? undefined : BLUR}
        className={cn("object-cover", imgClassName)}
      />
    </div>
  );
}
