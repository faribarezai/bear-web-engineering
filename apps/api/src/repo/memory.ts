import { randomUUID } from 'node:crypto';
import type { Bear, Comment, CreateCommentInput } from '../schema.js';
import type { BearRepository, CommentRepository } from './types.js';

export class InMemoryBearRepository implements BearRepository {
  private readonly bears = new Map<string, Bear>();

  constructor(initialBears: Bear[] = []) {
    for (const bear of initialBears) {
      this.bears.set(bear.id, bear);
    }
  }

  async findAll(): Promise<Bear[]> {
    return Array.from(this.bears.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  async findById(id: string): Promise<Bear | undefined> {
    return this.bears.get(id);
  }
}

export class InMemoryCommentRepository implements CommentRepository {
  private readonly comments = new Map<string, Comment>();

  async findByBearId(bearId: string): Promise<Comment[]> {
    const result: Comment[] = [];
    for (const comment of this.comments.values()) {
      if (comment.bearId === bearId) {
        result.push(comment);
      }
    }
    return result;
  }

  async create(bearId: string, input: CreateCommentInput): Promise<Comment> {
    const comment: Comment = {
      id: randomUUID(),
      bearId,
      author: input.author,
      text: input.text,
      createdAt: new Date().toISOString(),
    };
    this.comments.set(comment.id, comment);
    return comment;
  }

  async deleteById(commentId: string): Promise<boolean> {
    return this.comments.delete(commentId);
  }
}
