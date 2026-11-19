import { asc, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as dbSchema from '../db/schema.js';
import { bears, comments } from '../db/schema.js';
import type { Bear, Comment, CreateCommentInput } from '../schema.js';
import type { BearRepository, CommentRepository } from './types.js';

type Database = NodePgDatabase<typeof dbSchema>;

export class DrizzleBearRepository implements BearRepository {
  constructor(private readonly db: Database) {}

  async findAll(): Promise<Bear[]> {
    return await this.db
      .select({
        id: bears.id,
        name: bears.name,
        binomial: bears.binomial,
        range: bears.range,
        image: bears.imageUrl,
      })
      .from(bears)
      .orderBy(asc(bears.name));
  }

  async findById(id: string): Promise<Bear | undefined> {
    const [bear] = await this.db
      .select({
        id: bears.id,
        name: bears.name,
        binomial: bears.binomial,
        range: bears.range,
        image: bears.imageUrl,
      })
      .from(bears)
      .where(eq(bears.id, id));

    return bear;
  }
}

export class DrizzleCommentRepository implements CommentRepository {
  constructor(private readonly db: Database) {}

  async findByBearId(bearId: string): Promise<Comment[]> {
    const rows = await this.db
      .select()
      .from(comments)
      .where(eq(comments.bearId, bearId))
      .orderBy(asc(comments.createdAt));

    return rows.map((row) => ({
      id: row.id,
      bearId: row.bearId,
      author: row.author,
      text: row.text,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async create(bearId: string, input: CreateCommentInput): Promise<Comment> {
    const [created] = await this.db
      .insert(comments)
      .values({
        bearId,
        author: input.author,
        text: input.text,
      })
      .returning();

    if (created === undefined) {
      throw new Error('Failed to insert comment.');
    }

    return {
      id: created.id,
      bearId: created.bearId,
      author: created.author,
      text: created.text,
      createdAt: created.createdAt.toISOString(),
    };
  }

  async deleteById(commentId: string): Promise<boolean> {
    const deleted = await this.db
      .delete(comments)
      .where(eq(comments.id, commentId))
      .returning({ id: comments.id });

    return deleted.length > 0;
  }
}
