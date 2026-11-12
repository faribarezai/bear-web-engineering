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
