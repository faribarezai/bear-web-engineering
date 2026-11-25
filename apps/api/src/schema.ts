import { z } from 'zod';

// UserRoleSchema
export const UserRoleSchema = z.enum(['user', 'moderator']);
export type UserRole = z.infer<typeof UserRoleSchema>;

// RegisterUserSchema
export const RegisterUserSchema = z.object({
  email: z.email('Invalid email format.').trim().toLowerCase(),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters long.')
    .max(128, 'Password must be at most 128 characters long.'),
});

export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;
// UserSchema
export const UserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  role: UserRoleSchema,
  createdAt: z.iso.datetime(),
});

export type User = z.infer<typeof UserSchema>;

export const BearSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  binomial: z.string().min(1),
  range: z.string().min(1),
  image: z.url().nullable(),
});

export type Bear = z.infer<typeof BearSchema>;

export const BearsResponseSchema = z.array(BearSchema);

export interface BearRow {
  name: string;
  binomial: string;
  fileName: string | null;
  range: string;
}

export function slugifyBinomial(binomial: string): string {
  return binomial
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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
  id: z.uuid(),
  bearId: z.string().min(1),
  authorId: z.uuid().nullable(),
  author: z.string().min(1),
  text: z.string().min(1),
  createdAt: z.iso.datetime(),
});

export type Comment = z.infer<typeof CommentSchema>;

export const CommentsResponseSchema = z.array(CommentSchema);

export const BearIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const CommentIdParamsSchema = z.object({
  commentId: z.uuid(),
});

export const HealthResponseSchema = z.object({
  status: z.string(),
  version: z.string(),
  uptime: z.number(),
});

export const ValidationIssueSchema = z.object({
  field: z.string(),
  message: z.string(),
});

export const ProblemDetailsSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number().int(),
  detail: z.string(),
  instance: z.string(),
  requestId: z.string(),
  errors: z.array(ValidationIssueSchema).optional(),
});


export const LoginUserSchema = z.object({
  email: z.email('Invalid email format.').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required.'),
});

export type LoginUserInput = z.infer<typeof LoginUserSchema>;