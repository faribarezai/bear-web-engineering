import argon2 from 'argon2';
import { sql } from 'drizzle-orm';
import { db, pool } from '../db.js';
import { bears, users } from './schema.js';
import { getNormalizedBears } from '../wikipedia.js';

const fetchedBears = await getNormalizedBears();

await db
  .insert(bears)
  .values(
    fetchedBears.map((bear) => ({
      id: bear.id,
      name: bear.name,
      binomial: bear.binomial,
      imageUrl: bear.image,
      range: bear.range,
      fetchedAt: new Date(),
    }))
  )
  .onConflictDoUpdate({
    target: bears.id,
    set: {
      name: sql`excluded.name`,
      binomial: sql`excluded.binomial`,
      imageUrl: sql`excluded.image_url`,
      range: sql`excluded.range`,
      fetchedAt: sql`excluded.fetched_at`,
    },
  });

const modPasswordHash = await argon2.hash('moderator-password-123', {
  type: argon2.argon2id,
});

await db
  .insert(users)
  .values({
    email: 'mod@example.com',
    passwordHash: modPasswordHash,
    role: 'moderator',
  })
  .onConflictDoUpdate({
    target: users.email,
    set: {
      role: 'moderator',
    },
  });

await pool.end();
console.log(
  `Seeded ${fetchedBears.length} bears and moderator (mod@example.com).`
);
