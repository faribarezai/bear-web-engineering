import type { Bear, Comment, CreateCommentInput } from '../schema.js';

export interface BearRepository {
  findAll: () => Promise<Bear[]>;
  findById: (id: string) => Promise<Bear | undefined>;
}

export interface CommentRepository {
  findByBearId: (bearId: string) => Promise<Comment[]>;
  create: (bearId: string, input: CreateCommentInput) => Promise<Comment>;
  deleteById: (commentId: string) => Promise<boolean>;
}
