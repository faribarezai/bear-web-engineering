export interface ValidationIssue {
  field: string;
  message: string;
}

export class ProblemError extends Error {
  public readonly status: number;
  public readonly title: string;
  public readonly type: string;
  public readonly detail: string;
  public readonly errors?: ValidationIssue[];

  constructor(options: {
    status: number;
    title: string;
    detail: string;
    type?: string;
    errors?: ValidationIssue[];
  }) {
    super(options.detail);
    this.name = this.constructor.name;
    this.status = options.status;
    this.title = options.title;
    this.detail = options.detail;
    this.type = options.type ?? `https://httpstatuses.io/${options.status}`;
    if (options.errors !== undefined) {
      this.errors = options.errors;
    }
  }
}

export class BadRequestError extends ProblemError {
  constructor(detail: string, errors?: ValidationIssue[]) {
    super({
      status: 400,
      title: 'Bad Request',
      detail,
      type: 'https://example.org/problems/bad-request',
      ...(errors !== undefined ? { errors } : {}),
    });
  }
}

export class NotFoundError extends ProblemError {
  constructor(detail: string) {
    super({
      status: 404,
      title: 'Not Found',
      detail,
      type: 'https://example.org/problems/not-found',
    });
  }
}

export class UpstreamError extends ProblemError {
  constructor(detail: string, status: 502 | 504 = 502) {
    super({
      status,
      title: status === 504 ? 'Gateway Timeout' : 'Bad Gateway',
      detail,
      type:
        status === 504
          ? 'https://example.org/problems/gateway-timeout'
          : 'https://example.org/problems/bad-gateway',
    });
  }
}
