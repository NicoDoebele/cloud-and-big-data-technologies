import { z } from "zod";

const envSchema = z.object({
  //MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  MONGODB_URI: z.string(),
});

const env = envSchema.parse(process.env);

export default env;
