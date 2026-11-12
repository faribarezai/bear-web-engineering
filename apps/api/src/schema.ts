import { z } from 'zod';

export const BearSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  binomial: z.string().min(1),
  range: z.string().min(1),
  image: z.string().url().nullable(),
});

export type Bear = z.infer<typeof BearSchema>;

export const BearsResponseSchema = z.array(BearSchema);

export interface BearRow {
  name: string;
  binomial: string;
  fileName: string | null;
  range: string;
}

/**
 * Erzeugt einen stabilen, URL-sicheren Slug aus dem binomialen Namen.
 * Beispiel: "Ursus arctos" -> "ursus-arctos"
 */
export function slugifyBinomial(binomial: string): string {
  return binomial
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

//
export const CreateCommentSchema = z.object({
  author: z
    .string()
    .trim()
    .min(1, 'Author must not be empty.')
    .max(80, 'Author must be at most 80 characters.'),
  text: z
    .string()
    .trim()
    .min(1, 'Comment text must not be empty.')
    .max(1000, 'Comment text must be at most 1000 characters.'),
});

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;

export const CommentSchema = z.object({
  id: z.string().uuid(),
  bearId: z.string().min(1),
  author: z.string().min(1),
  text: z.string().min(1),
  createdAt: z.string().datetime(),
});

export type Comment = z.infer<typeof CommentSchema>;
