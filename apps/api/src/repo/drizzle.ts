import { asc, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as dbSchema from '../db/schema.js';
import { bears, comments, users, sessions } from '../db/schema.js';
import type {
  Bear,
  Comment,
  CreateCommentInput,
  User,
  UserRole,
} from '../schema.js';
import type {
  BearRepository,
  CommentRepository,
  CreateUserParams,
  UserRecord,
  UserRepository,
} from './types.js';
import { ConflictError } from '../errors.js';

import { randomBytes } from 'node:crypto';
import type { SessionRecord, SessionRepository } from './types.js';

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
      authorId: row.authorId,
      author: row.author,
      text: row.text,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async findById(commentId: string): Promise<Comment | undefined> {
    const [row] = await this.db
        .select()
        .from(comments)
        .where(eq(comments.id, commentId))
        .limit(1);

    if (row === undefined) {
      return undefined;
    }

    return {
      id: row.id,
      bearId: row.bearId,
      authorId: row.authorId,
      author: row.author,
      text: row.text,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async create(
      bearId: string,
      input: CreateCommentInput,
      authorId: string
  ): Promise<Comment> {
    const [created] = await this.db
        .insert(comments)
        .values({
          bearId,
          authorId,
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
      authorId: created.authorId,
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

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: NodePgDatabase<typeof dbSchema>) {}

  async findByEmail(email: string): Promise<UserRecord | undefined> {
    const normalizedEmail = email.trim().toLowerCase();
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (row === undefined) {
      return undefined;
    }

    return {
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      role: row.role as UserRole,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async findById(id: string): Promise<UserRecord | undefined> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (row === undefined) {
      return undefined;
    }

    return {
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      role: row.role as UserRole,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async create(params: CreateUserParams): Promise<User> {
    const normalizedEmail = params.email.trim().toLowerCase();
    try {
      const [inserted] = await this.db
        .insert(users)
        .values({
          email: normalizedEmail,
          passwordHash: params.passwordHash,
          role: params.role ?? 'user',
        })
        .returning();

      if (inserted === undefined) {
        throw new Error('Failed to insert user.');
      }

      return {
        id: inserted.id,
        email: inserted.email,
        role: inserted.role as UserRole,
        createdAt: inserted.createdAt.toISOString(),
      };
    } catch (error) {
      const pgCode =
        (error as { code?: string; cause?: { code?: string } })?.code ??
        (error as { cause?: { code?: string } })?.cause?.code;
      if (pgCode === '23505') {
        throw new ConflictError(
          `A user with email '${normalizedEmail}' already exists.`
        );
      }
      throw error;
    }
  }
}


export class DrizzleSessionRepository implements SessionRepository {
  constructor(private readonly db: NodePgDatabase<typeof dbSchema>) {}

  async create(userId: string, expiresAt: Date): Promise<SessionRecord> {
    const id = randomBytes(32).toString('base64url');
    const [inserted] = await this.db
        .insert(sessions)
        .values({
          id,
          userId,
          expiresAt,
        })
        .returning();

    if (inserted === undefined) {
      throw new Error('Failed to create session.');
    }

    return inserted;
  }

  async findById(id: string): Promise<SessionRecord | undefined> {
    const [row] = await this.db
        .select()
        .from(sessions)
        .where(eq(sessions.id, id))
        .limit(1);

    return row;
  }

  async deleteById(id: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.id, id));
  }
}