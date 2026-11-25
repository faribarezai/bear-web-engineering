import { randomUUID, randomBytes } from 'node:crypto';
import type { Bear, Comment, CreateCommentInput, User } from '../schema.js';
import type {
  BearRepository,
  CommentRepository,
  CreateUserParams,
  UserRepository,
  UserRecord,
  SessionRecord,
  SessionRepository,
} from './types.js';
import { ConflictError } from '../errors.js';

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

export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, UserRecord>();

  async findByEmail(email: string): Promise<UserRecord | undefined> {
    const normalized = email.trim().toLowerCase();
    for (const user of this.users.values()) {
      if (user.email === normalized) {
        return user;
      }
    }
    return undefined;
  }

  async findById(id: string): Promise<UserRecord | undefined> {
    return this.users.get(id);
  }

  async create(params: CreateUserParams): Promise<User> {
    const normalized = params.email.trim().toLowerCase();
    const existing = await this.findByEmail(normalized);
    if (existing !== undefined) {
      throw new ConflictError(
        `A user with email '${normalized}' already exists.`
      );
    }

    const record: UserRecord = {
      id: randomUUID(),
      email: normalized,
      passwordHash: params.passwordHash,
      role: params.role ?? 'user',
      createdAt: new Date().toISOString(),
    };
    this.users.set(record.id, record);

    const { passwordHash: _ignored, ...publicUser } = record;
    return publicUser;
  }
}

export class InMemorySessionRepository implements SessionRepository {
  private readonly sessions = new Map<string, SessionRecord>();

  async create(userId: string, expiresAt: Date): Promise<SessionRecord> {
    const record: SessionRecord = {
      id: randomBytes(32).toString('base64url'),
      userId,
      expiresAt,
      createdAt: new Date(),
    };
    this.sessions.set(record.id, record);
    return record;
  }

  async findById(id: string): Promise<SessionRecord | undefined> {
    return this.sessions.get(id);
  }

  async deleteById(id: string): Promise<void> {
    this.sessions.delete(id);
  }
}