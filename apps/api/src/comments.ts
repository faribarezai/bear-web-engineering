import { randomUUID } from 'node:crypto';
import type { Comment, CreateCommentInput } from './schema.js';

// In-Memory-Speicher: commentId -> Comment
const commentsStore = new Map<string, Comment>();

export function getCommentsForBear(bearId: string): Comment[] {
  const result: Comment[] = [];
  for (const comment of commentsStore.values()) {
    if (comment.bearId === bearId) {
      result.push(comment);
    }
  }
  return result;
}

export function createComment(
  bearId: string,
  input: CreateCommentInput
): Comment {
  const comment: Comment = {
    id: randomUUID(),
    bearId,
    author: input.author,
    text: input.text,
    createdAt: new Date().toISOString(),
  };

  commentsStore.set(comment.id, comment);
  return comment;
}

export function deleteComment(commentId: string): boolean {
  return commentsStore.delete(commentId);
}
