declare module 'better-sqlite3' {
  interface Database {
    exec(sql: string): this;
    prepare(sql: string): Statement;
    transaction(fn: () => any): (...args: any[]) => any;
    close(): this;
  }

  interface Statement {
    run(...params: any[]): RunResult;
    get(...params: any[]): any;
    all(...params: any[]): any[];
  }

  interface RunResult {
    changes: number;
    lastInsertRowid: number | bigint;
  }

  class Database {
    constructor(filename: string, options?: any);
  }

  export = Database;
}
