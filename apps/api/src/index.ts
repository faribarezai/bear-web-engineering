import { buildApp } from './app.js';
import { db, env, pool } from './db.js';
import {
  DrizzleBearRepository,
  DrizzleCommentRepository,
} from './repo/drizzle.js';

const app = await buildApp({
  bearRepo: new DrizzleBearRepository(db),
  commentRepo: new DrizzleCommentRepository(db),
  corsOrigins: env.CORS_ORIGINS,
  checkReady: async () => {
    try {
      await pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  },
});

const closeGracefully = async (): Promise<void> => {
  await app.close();
  await pool.end();
  process.exit(0);
};

process.on('SIGINT', (): void => {
  void closeGracefully();
});

process.on('SIGTERM', (): void => {
  void closeGracefully();
});

try {
  await app.listen({ port: env.PORT, host: env.HOST });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
