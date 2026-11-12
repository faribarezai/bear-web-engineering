import Fastify from 'fastify';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { getNormalizedBears } from './wikipedia.js';
import { CreateCommentSchema } from './schema.js';
import {
  createComment,
  deleteComment,
  getCommentsForBear,
} from './comments.js';
import {
  BadRequestError,
  NotFoundError,
  ProblemError,
  type ValidationIssue,
} from './errors.js';

const pkg = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf-8')
) as { version: string };

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  requestId: string;
  errors?: ValidationIssue[];
}

const app = Fastify({
  logger: true,
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'requestId',
  genReqId: (req) => {
    const incoming = req.headers['x-request-id'];
    if (typeof incoming === 'string' && incoming.trim().length > 0) {
      return incoming.trim();
    }
    return randomUUID();
  },
});

// x-request-id in jeden Response-Header schreiben
app.addHook('onSend', async (request, reply, payload) => {
  void reply.header('x-request-id', request.id);
  return payload;
});

// Zentraler RFC 9457 Error-Handler
app.setErrorHandler(async (error, request, reply) => {
  const instance = `${request.url}#${request.id}`;

  // 1. Eigene typisierte ProblemErrors (400, 404, 502, 504)
  if (error instanceof ProblemError) {
    if (error.status >= 500) {
      request.log.error({ err: error }, error.detail);
    } else {
      request.log.warn({ status: error.status }, error.detail);
    }

    const problem: ProblemDetails = {
      type: error.type,
      title: error.title,
      status: error.status,
      detail: error.detail,
      instance,
      requestId: request.id,
      ...(error.errors !== undefined ? { errors: error.errors } : {}),
    };

    return await reply
      .code(error.status)
      .type('application/problem+json')
      .send(problem);
  }

  // 2. Fastify JSON-Parsing / Media-Type / Validation Fehler -> 400
  const fastifyErr = error as { statusCode?: number; message?: string };
  if (
    typeof fastifyErr.statusCode === 'number' &&
    fastifyErr.statusCode >= 400 &&
    fastifyErr.statusCode < 500
  ) {
    const detail =
      fastifyErr.statusCode === 415
        ? 'Content-Type must be application/json.'
        : 'Malformed JSON request body.';

    request.log.warn({ err: error }, detail);

    const problem: ProblemDetails = {
      type: 'https://example.org/problems/bad-request',
      title: 'Bad Request',
      status: 400,
      detail,
      instance,
      requestId: request.id,
      errors: [{ field: 'body', message: detail }],
    };

    return await reply.code(400).type('application/problem+json').send(problem);
  }

  // 3. Unerwartete Fehler -> 500 ohne Stacktrace oder Interna
  request.log.error({ err: error }, 'Unhandled internal server error');

  const internalProblem: ProblemDetails = {
    type: 'https://example.org/problems/internal-server-error',
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected internal error occurred.',
    instance,
    requestId: request.id,
  };

  return await reply
    .code(500)
    .type('application/problem+json')
    .send(internalProblem);
});

// Unbekannte Routen ebenfalls als RFC 9457 404 liefern
app.setNotFoundHandler(async (request, reply) => {
  const detail = `Route ${request.method} ${request.url} not found.`;
  request.log.warn({ status: 404 }, detail);

  const problem: ProblemDetails = {
    type: 'https://example.org/problems/not-found',
    title: 'Not Found',
    status: 404,
    detail,
    instance: `${request.url}#${request.id}`,
    requestId: request.id,
  };

  return await reply.code(404).type('application/problem+json').send(problem);
});

app.get('/health', async () => ({
  status: 'ok',
  version: pkg.version,
  uptime: process.uptime(),
}));

// Absichtlicher 500er-Testendpunkt (zeigt, dass Interna/Stacktrace verborgen bleiben)
app.get('/debug/boom', async () => {
  throw new Error('SECRET_DB_PASSWORD=supersecret; internal crash at line 42');
});

app.get('/bears', async () => {
  return await getNormalizedBears();
});

app.get<{ Params: { id: string } }>('/bears/:id', async (request) => {
  const bears = await getNormalizedBears();
  const bear = bears.find((item) => item.id === request.params.id);

  if (bear === undefined) {
    throw new NotFoundError(`Bear with id '${request.params.id}' not found.`);
  }

  return bear;
});

app.get<{ Params: { id: string } }>('/bears/:id/comments', async (request) => {
  const bears = await getNormalizedBears();
  const bearExists = bears.some((item) => item.id === request.params.id);

  if (!bearExists) {
    throw new NotFoundError(`Bear with id '${request.params.id}' not found.`);
  }

  return getCommentsForBear(request.params.id);
});

app.post<{ Params: { id: string } }>(
  '/bears/:id/comments',
  async (request, reply) => {
    const parsedBody = CreateCommentSchema.safeParse(request.body);
    if (!parsedBody.success) {
      const issues: ValidationIssue[] = parsedBody.error.issues.map((issue) => {
        const path = issue.path.join('.');
        return {
          field: path.length > 0 ? path : 'body',
          message: issue.message,
        };
      });
      throw new BadRequestError('Invalid comment input.', issues);
    }

    const bears = await getNormalizedBears();
    const bearExists = bears.some((item) => item.id === request.params.id);

    if (!bearExists) {
      throw new NotFoundError(`Bear with id '${request.params.id}' not found.`);
    }

    const comment = createComment(request.params.id, parsedBody.data);

    return await reply
      .code(201)
      .header('Location', `/api/comments/${comment.id}`)
      .send(comment);
  }
);

app.delete<{ Params: { commentId: string } }>(
  '/comments/:commentId',
  async (request, reply) => {
    const deleted = deleteComment(request.params.commentId);

    if (!deleted) {
      throw new NotFoundError(
        `Comment with id '${request.params.commentId}' not found.`
      );
    }

    return await reply.code(204).send();
  }
);

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';

try {
  await app.listen({ port, host });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
