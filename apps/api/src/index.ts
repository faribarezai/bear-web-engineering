import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import {
  hasZodFastifySchemaValidationErrors,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { getNormalizedBears } from './wikipedia.js';
import {
  BearIdParamsSchema,
  BearSchema,
  BearsResponseSchema,
  CommentIdParamsSchema,
  CommentSchema,
  CommentsResponseSchema,
  CreateCommentSchema,
  HealthResponseSchema,
  ProblemDetailsSchema,
} from './schema.js';
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

const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

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
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// 1. CORS mit strikter Allow-List aus Umgebungsvariable
await app.register(cors, {
  origin: (origin, callback) => {
    // Requests ohne Origin-Header (z. B. curl, Server-to-Server, Same-Origin) erlauben
    if (origin === undefined) {
      callback(null, true);
      return;
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    // callback(new Error(`Origin '${origin}' not allowed by CORS`), false);
    callback(null, false);
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-request-id'],
  exposedHeaders: ['Location', 'x-request-id'],
});

// 2. OpenAPI 3.1 aus Zod-Schemas generieren
await app.register(swagger, {
  openapi: {
    openapi: '3.1.0',
    info: {
      title: 'Wildlife & Ursids API',
      description:
        'BFF for Wikipedia bear species and RESTful comments API with RFC 9457 Problem Details.',
      version: pkg.version,
    },
    servers: [
      { url: '/api', description: 'Via Frontend Dev/Preview Proxy' },
      { url: 'http://localhost:3000', description: 'Direct API Server' },
    ],
  },
  transform: jsonSchemaTransform,
});

// Swagger UI unter /docs (über Vite-Proxy erreichbar als /api/docs)
await app.register(swaggerUi, {
  routePrefix: '/docs',
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

  // 2. Zod-Validierungsfehler aus Fastify-Schema -> 400 mit errors-Array
  if (hasZodFastifySchemaValidationErrors(error)) {
    const issues: ValidationIssue[] = error.validation.map((issue) => {
      const cleanPath = issue.instancePath
        .replace(/^\//, '')
        .replace(/\//g, '.');
      return {
        field: cleanPath.length > 0 ? cleanPath : 'body',
        message: issue.message ?? 'Invalid input.',
      };
    });

    request.log.warn({ issues }, 'Request schema validation failed');

    const problem: ProblemDetails = {
      type: 'https://example.org/problems/bad-request',
      title: 'Bad Request',
      status: 400,
      detail: 'Invalid request input.',
      instance,
      requestId: request.id,
      errors: issues,
    };

    return await reply.code(400).type('application/problem+json').send(problem);
  }

  // 3. Fastify JSON-Parsing / Media-Type Fehler -> 400
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

  // 4. Unerwartete Fehler -> 500 ohne Stacktrace oder Interna
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

// --- Routen mit OpenAPI-Schemas ---

app.get(
  '/health',
  {
    schema: {
      summary: 'Health check',
      tags: ['System'],
      response: {
        200: HealthResponseSchema,
      },
    },
  },
  async () => ({
    status: 'ok',
    version: pkg.version,
    uptime: process.uptime(),
  })
);

app.get(
  '/debug/boom',
  {
    schema: {
      summary: 'Provoke an internal server error (500 demo)',
      tags: ['System'],
      response: {
        500: ProblemDetailsSchema,
      },
    },
  },
  async () => {
    throw new Error(
      'SECRET_DB_PASSWORD=supersecret; internal crash at line 42'
    );
  }
);

app.get(
  '/bears',
  {
    schema: {
      summary: 'List all normalized bears from Wikipedia',
      tags: ['Bears'],
      response: {
        200: BearsResponseSchema,
        502: ProblemDetailsSchema,
        504: ProblemDetailsSchema,
      },
    },
  },
  async () => {
    return await getNormalizedBears();
  }
);

app.get(
  '/bears/:id',
  {
    schema: {
      summary: 'Get a single bear by slug ID',
      tags: ['Bears'],
      params: BearIdParamsSchema,
      response: {
        200: BearSchema,
        404: ProblemDetailsSchema,
        502: ProblemDetailsSchema,
        504: ProblemDetailsSchema,
      },
    },
  },
  async (request) => {
    const bears = await getNormalizedBears();
    const bear = bears.find((item) => item.id === request.params.id);

    if (bear === undefined) {
      throw new NotFoundError(`Bear with id '${request.params.id}' not found.`);
    }

    return bear;
  }
);

app.get(
  '/bears/:id/comments',
  {
    schema: {
      summary: 'List all comments for a bear',
      tags: ['Comments'],
      params: BearIdParamsSchema,
      response: {
        200: CommentsResponseSchema,
        404: ProblemDetailsSchema,
        502: ProblemDetailsSchema,
        504: ProblemDetailsSchema,
      },
    },
  },
  async (request) => {
    const bears = await getNormalizedBears();
    const bearExists = bears.some((item) => item.id === request.params.id);

    if (!bearExists) {
      throw new NotFoundError(`Bear with id '${request.params.id}' not found.`);
    }

    return getCommentsForBear(request.params.id);
  }
);

app.post(
  '/bears/:id/comments',
  {
    schema: {
      summary: 'Create a new comment for a bear',
      tags: ['Comments'],
      params: BearIdParamsSchema,
      body: CreateCommentSchema,
      response: {
        201: CommentSchema,
        400: ProblemDetailsSchema,
        404: ProblemDetailsSchema,
        502: ProblemDetailsSchema,
        504: ProblemDetailsSchema,
      },
    },
  },
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

app.delete(
  '/comments/:commentId',
  {
    schema: {
      summary: 'Delete a comment by UUID',
      tags: ['Comments'],
      params: CommentIdParamsSchema,
      response: {
        204: z.null().describe('Comment deleted'),
        404: ProblemDetailsSchema,
      },
    },
  },
  async (request, reply) => {
    const deleted = deleteComment(request.params.commentId);

    if (!deleted) {
      throw new NotFoundError(
        `Comment with id '${request.params.commentId}' not found.`
      );
    }
    /** DELETE-Route im Schema für 204 z.null() -> send(null)**/
    return await reply.code(204).send(null);
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
