
type SqlPrimitive = string | number | boolean | Date | null;
type SqlParam = SqlPrimitive | SqlPrimitive[] | Record<string, unknown>;

export class Sql {
  #sql: string;
  #params: SqlParam[];

  constructor(
    strings: TemplateStringsArray,
    values: (SqlParam | Sql)[]
  ) {
    let sql = "";
    const params: SqlParam[] = [];

    for (let i = 0; i < strings.length; i++) {
      sql += strings[i];
      if (i < values.length) {
        const value = values[i];
        if (value instanceof Sql) {
          // Merge the nested query's SQL and params
          sql += value.#sql;
          params.push(...value.#params);
        } else {
          // Add the value as a parameter
          sql += `$${params.length + 1}`;
          params.push(value);
        }
      }
    }

    this.#sql = sql;
    this.#params = params;
  }

  get sql() {
    return this.#sql;
  }

  get params() {
    return this.#params;
  }
}

/**
 * A template tag for writing safe, parameterized SQL queries.
 * @example
 * const userId = 123;
 * const query = sql`SELECT * FROM users WHERE id = ${userId}`;
 * // query.sql = "SELECT * FROM users WHERE id = $1"
 * // query.params = [123]
 */
export const sql = (
  strings: TemplateStringsArray,
  ...values: (SqlParam | Sql)[]
) => {
  return new Sql(strings, values);
};
