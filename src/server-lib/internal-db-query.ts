import { internalDbClient } from "./internal-db";
import { Sql } from "./sql-tag";

type SqlPrimitive = string | number | boolean | Date | null;
type SqlParam = SqlPrimitive | SqlPrimitive[] | Record<string, unknown>;

/**
 * Query the app's internal Postgres database via the Vybe API
 * @param query - The SQL query to execute, using $1, $2, etc. for parameters
 * @returns The result rows from the query
 * @example
 * const result = await queryInternalDatabase(
 *   sql`SELECT * FROM items WHERE name = ${"example"}`
 * );
 * // result = [ { id: "abc123", name: "example", createdAt: "2025-09-04T11:03:20.107Z" }, ... ]
 *
 * // Using arrays for ANY clauses:
 * const users = await queryInternalDatabase(
 *   sql`SELECT * FROM users WHERE id = ANY(${[1, 2, 3]})`
 * );
 *
 * // Using objects for JSONB columns:
 * await queryInternalDatabase(
 *   sql`INSERT INTO events (data) VALUES (${{ event: "click", page: "/home" }})`
 * );
 */
export async function queryInternalDatabase(query: Sql) {
  const response = await internalDbClient.post<Record<string, unknown>[]>(
    "/query",
    { sql: query.sql, params: query.params }
  );
  return response.data;
}
