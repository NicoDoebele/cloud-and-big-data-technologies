import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().optional(),
  MONGODB_HOST: z.string().optional(),
  MONGODB_PORT: z.string().optional(),
  MONGODB_USERNAME: z.string().optional(),
  MONGODB_PASSWORD: z.string().optional(),
  MONGODB_DATABASE: z.string().optional(),
  MONGODB_AUTH_DATABASE: z.string().optional(),
});

const env = envSchema.parse(process.env);

export function buildMongoUri(): string {
  if (env.MONGODB_URI) {
    return env.MONGODB_URI;
  }

  const host = env.MONGODB_HOST || '127.0.0.1';
  const port = env.MONGODB_PORT || '27017';
  const username = env.MONGODB_USERNAME;
  const password = env.MONGODB_PASSWORD;
  const database = env.MONGODB_DATABASE || 'twutter';
  const authDatabase = env.MONGODB_AUTH_DATABASE || database;

  if (username && password) {
    return `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=${authDatabase}`;
  }

  return `mongodb://${host}:${port}/${database}`;
}

export default env;
