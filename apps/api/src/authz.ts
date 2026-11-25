import { ForbiddenError, UnauthorizedError } from './errors.js';
import type { User } from './schema.js';

export function requireAuth(user: User | undefined): User {
  if (user === undefined) {
    throw new UnauthorizedError('Authentication required.');
  }
  return user;
}

export function canDeleteComment(
  user: User,
  comment: { authorId: string | null }
): boolean {
  if (user.role === 'moderator') {
    return true;
  }
  return comment.authorId !== null && comment.authorId === user.id;
}

export function assertCanDeleteComment(
  user: User | undefined,
  comment: { authorId: string | null }
): void {
  const authenticated = requireAuth(user);
  if (!canDeleteComment(authenticated, comment)) {
    throw new ForbiddenError('You are not allowed to delete this comment.');
  }
}
