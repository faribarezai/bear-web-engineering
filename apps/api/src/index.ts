import Fastify from 'fastify';
import { readFileSync } from 'node:fs';
import { getNormalizedBears, UpstreamError } from './wikipedia.js';
import { CreateCommentSchema } from './schema.js';
import {
  createComment,
  deleteComment,
  getCommentsForBear,
} from './comments.js';

const pkg = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf-8')
) as { version: string };

const app = Fastify({ logger: true });

app.get('/health', async () => ({
  status: 'ok',
  version: pkg.version,
  uptime: process.uptime(),
}));

app.get('/bears', async (_request, reply) => {
  try {
    const bears = await getNormalizedBears();
    return bears;
  } catch (error: unknown) {
    if (error instanceof UpstreamError) {
      return await reply.code(error.statusCode).send({
        error: error.message,
      });
    }
    app.log.error(error);
    return await reply.code(502).send({
      error: 'Unexpected upstream failure.',
    });
  }
});

app.get<{ Params: { id: string } }>('/bears/:id', async (request, reply) => {
  try {
    const bears = await getNormalizedBears();
    const bear = bears.find((item) => item.id === request.params.id);

    if (bear === undefined) {
      return await reply.code(404).send({
        error: `Bear with id '${request.params.id}' not found.`,
      });
    }

    return bear;
  } catch (error: unknown) {
    if (error instanceof UpstreamError) {
      return await reply.code(error.statusCode).send({
        error: error.message,
      });
    }
    app.log.error(error);
    return await reply.code(502).send({
      error: 'Unexpected upstream failure.',
    });
  }
});

// GET /api/bears/:id/comments
app.get<{ Params: { id: string } }>(
  '/bears/:id/comments',
  async (request, reply) => {
    try {
      const bears = await getNormalizedBears();
      const bearExists = bears.some((item) => item.id === request.params.id);

      if (!bearExists) {
        return await reply.code(404).send({
          error: `Bear with id '${request.params.id}' not found.`,
        });
      }

      return getCommentsForBear(request.params.id);
    } catch (error: unknown) {
      if (error instanceof UpstreamError) {
        return await reply.code(error.statusCode).send({
          error: error.message,
        });
      }
      app.log.error(error);
      return await reply.code(502).send({
        error: 'Unexpected upstream failure.',
      });
    }
  }
);

// POST /api/bears/:id/comments -> 201 Created + Location
app.post<{ Params: { id: string } }>(
  '/bears/:id/comments',
  async (request, reply) => {
    const parsedBody = CreateCommentSchema.safeParse(request.body);
    if (!parsedBody.success) {
      return await reply.code(400).send({
        error: 'Invalid comment input.',
        details: parsedBody.error.flatten().fieldErrors,
      });
    }

    try {
      const bears = await getNormalizedBears();
      const bearExists = bears.some((item) => item.id === request.params.id);

      if (!bearExists) {
        return await reply.code(404).send({
          error: `Bear with id '${request.params.id}' not found.`,
        });
      }

      const comment = createComment(request.params.id, parsedBody.data);

      return await reply
        .code(201)
        .header('Location', `/api/comments/${comment.id}`)
        .send(comment);
    } catch (error: unknown) {
      if (error instanceof UpstreamError) {
        return await reply.code(error.statusCode).send({
          error: error.message,
        });
      }
      app.log.error(error);
      return await reply.code(502).send({
        error: 'Unexpected upstream failure.',
      });
    }
  }
);

// DELETE /api/comments/:commentId -> 204 No Content
app.delete<{ Params: { commentId: string } }>(
  '/comments/:commentId',
  async (request, reply) => {
    const deleted = deleteComment(request.params.commentId);

    if (!deleted) {
      return await reply.code(404).send({
        error: `Comment with id '${request.params.commentId}' not found.`,
      });
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
