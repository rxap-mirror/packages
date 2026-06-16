# TODO: nest-rabbitmq Library Audit & Improvements

This document lists the findings, architectural debt, logic bugs, and recommended improvements identified during the audit of the `@rxap/nest-rabbitmq` package.

---

## 1. Critical Logic Bugs

### 🔴 Incorrect Callback Parameter Resolution in `ClientRMQExchange`
* **File:** [client-rmq-exchange.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/rabbitmq/src/lib/client-rmq-exchange.ts#L230-L235)
* **Description:** In the `handleMessage` method, the code incorrectly checks `isFunction(options)` to determine if a callback was provided. However, `options` is initialized as `undefined` right before the check. Because of this, the check always evaluates to `false`, and the method tries to assign `options = optionsOrCallback`, keeping `callback` as `undefined`. Consequently, line 237 throws a `"No callback provided"` error whenever `handleMessage` is invoked without optional options.
* **Code Snippet:**
  ```typescript
  let options: Record<string, unknown> | undefined = undefined;
  if (isFunction(options)) { // <-- BUG: Always false, 'options' is undefined
    callback = options as (packet: WritePacket) => any;
  } else {
    options = optionsOrCallback as Record<string, unknown>;
  }
  ```
* **Recommended Fix:** Change `isFunction(options)` to `isFunction(optionsOrCallback)`:
  ```typescript
  let options: Record<string, unknown> | undefined = undefined;
  if (isFunction(optionsOrCallback)) {
    callback = optionsOrCallback as (packet: WritePacket) => any;
  } else {
    options = optionsOrCallback as Record<string, unknown>;
  }
  ```

---

## 2. Functional & Logic Errors

### 🟡 Unhandled `JSON.parse` in `ErrorDeserializer`
* **File:** [error.deserializer.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/rabbitmq/src/lib/error.deserializer.ts#L42-L43)
* **Description:** For error records classified as `'Unknown'`, the deserializer directly parses the message string:
  ```typescript
  case 'Unknown':
    return JSON.parse(record.message);
  ```
  If `record.message` is not a valid JSON string (e.g. empty, malformed, or if the original error was a plain non-JSON-stringified value), this throws a `SyntaxError` and crashes the entire deserialization pipeline.
* **Recommended Fix:** Wrap the parsing in a `try...catch` block:
  ```typescript
  case 'Unknown':
    try {
      return JSON.parse(record.message);
    } catch {
      return new Error(record.message);
    }
  ```

### 🟡 Insecure Env Flag Evaluation in `RabbitmqOptionsFactory`
* **File:** [rabbitmq-options-factory.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/rabbitmq/src/lib/rabbitmq-options-factory.ts#L23)
* **Description:** The factory checks the disabled status via:
  ```typescript
  if (this.config.get('RABBITMQ_DISABLED')) {
  ```
  If the `.env` file defines `RABBITMQ_DISABLED=false`, `config.get` will return the string `"false"`. In JavaScript, non-empty strings are truthy, meaning the code will incorrectly evaluate RabbitMQ as disabled.
* **Recommended Fix:** Explicitly compare the environment value as a boolean or parse it safely:
  ```typescript
  const disabled = this.config.get('RABBITMQ_DISABLED');
  if (disabled === true || disabled === 'true') {
  ```

---

## 3. Library & Generator Anti-Patterns

### 🟡 Nx Generator File Access & Virtual Tree Abuse
* **File:** [generator.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/rabbitmq/src/generators/init/generator.ts#L11-L14)
* **Description:**
  1. **Direct `__dirname` Reference**: The generator tries to read the package `package.json` file relative to the physical disk location of the generator (`__dirname`). This bypasses the virtual Tree, breaking dry-runs, tests, and compilation steps where the directory layout differs.
  2. **Interrogating `node_modules` in Virtual Tree**: The generator uses `tree.exists(...)` to check for paths inside `node_modules`. Because `node_modules` is gitignored and excluded from the Nx virtual Tree, these checks will fail or return `false`.
  3. **Physical Disk `require`**: The generator directly calls Node's physical disk `require` to import initializers from other libraries, completely bypassing the virtual tree.
* **Recommended Fix:**
  - Query workspace layout or package names using Nx Devkit utilities (`readProjectConfiguration` or path helpers).
  - Use physical `fs` operations only if strictly necessary, but avoid checking `node_modules` inside the `tree` object.

---

## 4. Architectural Debt

### 📋 Hardcoded Environment Variable Keys (Tight Coupling)
* **Files:** [rabbitmq-options-factory.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/rabbitmq/src/lib/rabbitmq-options-factory.ts), [client-rmq-exchange-module-options-factory.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/rabbitmq/src/lib/client-rmq-exchange-module-options-factory.ts)
* **Description:** The classes directly hardcode and access environment variables like `RABBITMQ_EXCHANGE_NAME`, `RABBITMQ_EXCHANGE_TYPE`, `RABBITMQ_DISABLED`, `RABBITMQ_HOST`, `RABBITMQ_PORT`, `RABBITMQ_VHOST`, `RABBITMQ_USERNAME`, `RABBITMQ_PASSWORD`, and `RABBITMQ_URI`. This couples the library tightly to global env names, preventing a consumer from instantiating multiple distinct RabbitMQ clients with different credentials or options.
* **Recommended Fix:** Accept configuration structures/options via an injected configuration token or pass them directly as constructor arguments instead of resolving them inside the core library factory classes.

---

## 5. Test Coverage

### 🔴 Missing Test Suites
* **Description:** There are absolutely no test files (`*.spec.ts`) in the package directory. Running `yarn nx run nest-rabbitmq:test` results in:
  ```text
  No tests found, exiting with code 0
  ```
* **Recommended Fix:**
  - Create integration and unit tests for `ClientRMQExchange`, `ServerRMQ`, `ErrorSerializer`, and `ErrorDeserializer` under a new `src/lib/__tests__` or matching `*.spec.ts` files.
  - Verify message serialization, exchange setup, connection lifecycle, and exception deserialization behavior.
