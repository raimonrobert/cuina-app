import "server-only";
import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Falta DATABASE_URL en las variables de entorno.");
}

// Cliente HTTP de Neon: una query = una petición HTTP, pensado para
// funciones serverless (Vercel). No mantiene una conexión TCP abierta.
export const sql = neon(connectionString);
