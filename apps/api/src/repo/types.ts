import type {
  Bear,
  Comment,
  CreateCommentInput,
  User,
  UserRole,
} from '../schema.js';

export interface BearRepository {
  findAll: () => Promise<Bear[]>;
  findById: (id: string) => Promise<Bear | undefined>;
}

export interface CommentRepository {
  findByBearId: (bearId: string) => Promise<Comment[]>;
  findById: (commentId: string) => Promise<Comment | undefined>;
  create: (
      bearId: string,
      input: CreateCommentInput,
      authorId: string
  ) => Promise<Comment>;
  deleteById: (commentId: string) => Promise<boolean>;
}

// Login, password
export interface UserRecord extends User {
  passwordHash: string;
}

export interface CreateUserParams {
  email: string;
  passwordHash: string;
  role?: UserRole;
}

export interface UserRepository {
  findByEmail: (email: string) => Promise<UserRecord | undefined>;
  findById: (id: string) => Promise<UserRecord | undefined>;
  create: (params: CreateUserParams) => Promise<User>;
}

export interface SessionRecord {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface SessionRepository {
  create: (userId: string, expiresAt: Date) => Promise<SessionRecord>;
  findById: (id: string) => Promise<SessionRecord | undefined>;
  deleteById: (id: string) => Promise<void>;
}