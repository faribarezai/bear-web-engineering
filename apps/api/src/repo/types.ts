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
  create: (bearId: string, input: CreateCommentInput) => Promise<Comment>;
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
