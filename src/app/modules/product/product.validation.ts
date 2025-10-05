import { z } from "zod";

export const CreateProductZodSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().min(4, "Description must be at least 4 characters long"),
  price: z.string().optional(),
  stock: z.string().optional(),
  category: z.string().min(2, "Category is required").optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be URL-friendly").optional(),
  newproduct: z.boolean().optional(),
  images: z.array(z.string().url("Must be a valid URL")).min(1, "At least one image is required").optional(),
  brand: z.string().optional(),
  sku: z.string().optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  isActive: z.boolean().default(true),
});

// ✅ Inferred Type
