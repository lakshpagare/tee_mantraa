import { v2 as cloudinary } from "cloudinary";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { ApiError } from "@/lib/api";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export const cloudinaryConfigured = () =>
  !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

export async function handleUpload(file: File, folder = "verano"): Promise<string> {
  if (!ALLOWED.includes(file.type)) throw new ApiError(415, "Only JPG, PNG, WebP or AVIF images are allowed");
  if (file.size > MAX_BYTES) throw new ApiError(413, "Image must be under 5MB");
  const buffer = Buffer.from(await file.arrayBuffer());

  if (cloudinaryConfigured()) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    return new Promise<string>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder, resource_type: "image" }, (err, result) => {
          if (err || !result) return reject(new ApiError(502, "Image upload failed"));
          resolve(result.secure_url);
        })
        .end(buffer);
    });
  }

  // Development fallback (not persistent on serverless hosts such as Vercel).
  if (process.env.NODE_ENV === "production") {
    throw new ApiError(503, "Image storage is not configured. Set the Cloudinary environment variables.");
  }
  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const name = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buffer);
  return `/uploads/${name}`;
}
