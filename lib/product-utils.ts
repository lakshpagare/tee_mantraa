import type { ProductDTO } from "@/types";

/** Safe to call from both Server and Client Components (this file is not a client module). */
export const categoryName = (p: Pick<ProductDTO, "category">) =>
  typeof p.category === "object" && p.category ? p.category.name : "";
