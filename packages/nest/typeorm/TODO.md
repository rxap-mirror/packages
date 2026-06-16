# TODO: `@rxap/nest-typeorm` Audit & Improvements

This file documents the findings, architectural debt, potential logic bugs, and recommended fixes identified during the project audit of `@rxap/nest-typeorm`.

---

## 🚨 Critical & High-Priority Bugs

### 1. Brittle and Greedy URL Obfuscation Regex
In `BaseTypeOrmModuleOptionsFactory.postgresConfig`, the password in the connection URL is obfuscated before being logged:
```typescript
`Connection string: ${credentials.url!.replace(/:.+@/g, ':******@')}`
```
- **The Issue:** The regex `/:.+@/g` is highly greedy. For a standard connection string like `postgres://username:password@localhost:5432/database`, it matches everything starting from the first `:` (after `postgres`) up to the last `@` (before `localhost`). This replaces the entire `://username:password@` block, resulting in the log printing `postgres:******@localhost:5432/database`. 
  - It completely erases the double slashes (`//`) and the username.
  - The resulting logged string is not a valid Postgres connection URI, which is confusing during debugging.
  - If a password itself or another part of the URI contains multiple colons or `@`, this greedy match can cause even larger log-truncation issues.
- **Recommended Fix:** Use a more specific, non-greedy, or structured parsing regex (or standard URL parser) to only replace the password portion, preserving the protocol, double slashes, and username.
  ```typescript
  // A safer regex that specifically targets the password part:
  const obfuscatedUrl = credentials.url!.replace(/(postgres(?:ql)?:\/\/[^:]+:)[^@]+(@)/, '$1******$2');
  ```

### 2. Conflicting SQLite Temp Database File
In `BaseTypeOrmModuleOptionsFactory.sqliteConfig`, the non-production fallback path is defined as:
```typescript
join(tmpdir(), `backend.sqlite`)
```
- **The Issue:** Sharing a hardcoded, static file `/tmp/backend.sqlite` across all developers' local microservices or concurrent test executions running on the same host will cause file lock contention, read/write race conditions, and schema mismatches.
- **Recommended Fix:** Append a unique application or process name (e.g. from `this.environment.app` or `process.pid`) to avoid collision.
  ```typescript
  join(tmpdir(), `${this.environment.app || 'backend'}-${process.pid}.sqlite`)
  ```

---

## 🛠️ Architectural Debt & Non-Reusable Design

### 1. Confusing Fallback Config Keys in `sqliteConfig`
`sqliteConfig()` delegates options loading to `this.baseConfig()`, which resolves `synchronize` and `logging` using Postgres-specific keys:
```typescript
synchronize: this.config.get(
  'POSTGRES_SYNCHRONIZE',
  this.config.getOrThrow('TYPEORM_SYNCHRONIZE')
),
logging: this.config.get(
  'POSTGRES_LOGGING',
  this.config.getOrThrow('TYPEORM_LOGGING')
),
```
- **The Issue:** It is confusing and conceptually incorrect for an SQLite database setup to probe `POSTGRES_SYNCHRONIZE` or `POSTGRES_LOGGING`.
- **Recommended Fix:** Refactor config resolution to probe driver-specific keys first, fallback to the generic `TYPEORM_*` keys, and avoid pulling Postgres configuration into the base config.
  ```typescript
  const synchronize = this.config.get(
    `${type.toUpperCase()}_SYNCHRONIZE`,
    this.config.get('TYPEORM_SYNCHRONIZE', false)
  );
  ```

### 2. Missing Joi Validation for Fallback Parameters
In `postgres-validation-schema.ts`, the environment variables `POSTGRES_SYNCHRONIZE` and `POSTGRES_LOGGING` are not declared.
- **The Issue:** Since they are not specified in the validation schema map, any environment-level values provided for them are bypassed by Joi validation, which can lead to runtime crashes if invalid formats are used.
- **Recommended Fix:** Add `POSTGRES_SYNCHRONIZE` and `POSTGRES_LOGGING` to the `postgresValidationSchema`.

### 3. Hardcoded Migrations Wildcard Ext (`/*.js`)
In `BaseTypeOrmModuleOptionsFactory.migrationConfig()`, the migrations glob pattern is hardcoded to `.js`:
```typescript
migrations: [ migrationsFolder + '/*.js' ],
```
- **The Issue:** During local development or unit testing (e.g. running NestJS with `ts-node`), migrations are typically author-compiled or written directly as TypeScript (`.ts`) files. Having `/*.js` hardcoded prevents migrations from being auto-run dynamically in TypeScript mode.
- **Recommended Fix:** Allow both extensions.
  ```typescript
  migrations: [ migrationsFolder + '/*.{js,ts}' ],
  ```

---

## 🧪 Testing & Test Coverage

- **The Issue:** The test suite contains **zero** tests. Running `yarn nx run nest-typeorm:test` outputs `No tests found, exiting with code 0`.
- **Recommended Fix:** Introduce unit and integration tests under a `src/lib/specs` or `src/lib/__tests__` folder to cover:
  - Correct parsing and validation of connection options using `postgresValidationSchema` and `sqliteValidationSchema`.
  - Proper output of `BaseTypeOrmModuleOptionsFactory` under different environments (`swagger`, `postgres`, `sqlite`).
  - Correctness of the URL password masking logic.
