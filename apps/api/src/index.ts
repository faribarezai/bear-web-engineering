import Fastify from 'fastify';
import { readFileSync } from 'node:fs';
import { getNormalizedBears, UpstreamError } from './wikipedia.js';

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

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';

try {
  await app.listen({ port, host });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
