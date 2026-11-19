import pg from 'pg';
import { z } from 'zod';

const EnvSchema = z.object({
    PORT: z.coerce.number().int().positive().default(3000),
    HOST: z.string().min(1).default('0.0.0.0'),
    CORS_ORIGINS: z.string().default('http://localhost:5173'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
});

// Validiert alle Env-Variablen sofort beim Start; crasht bei ungültiger Config
export const env = EnvSchema.parse(process.env);

// Ein einziger Connection Pool für die gesamte App-Laufzeit
export const pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
});