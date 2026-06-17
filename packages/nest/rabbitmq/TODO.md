# TODO: nest-rabbitmq Library Audit & Improvements

This document lists the findings, architectural debt, logic bugs, and recommended improvements identified during the audit of the `@rxap/nest-rabbitmq` package.

---

## 1. Library & Generator Anti-Patterns

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

## 2. Architectural Debt

### 📋 Hardcoded Environment Variable Keys (Tight Coupling)
* **Files:** [rabbitmq-options-factory.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/rabbitmq/src/lib/rabbitmq-options-factory.ts), [client-rmq-exchange-module-options-factory.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/rabbitmq/src/lib/client-rmq-exchange-module-options-factory.ts)
* **Description:** The classes directly hardcode and access environment variables like `RABBITMQ_EXCHANGE_NAME`, `RABBITMQ_EXCHANGE_TYPE`, `RABBITMQ_DISABLED`, `RABBITMQ_HOST`, `RABBITMQ_PORT`, `RABBITMQ_VHOST`, `RABBITMQ_USERNAME`, `RABBITMQ_PASSWORD`, and `RABBITMQ_URI`. This couples the library tightly to global env names, preventing a consumer from instantiating multiple distinct RabbitMQ clients with different credentials or options.
* **Recommended Fix:** Accept configuration structures/options via an injected configuration token or pass them directly as constructor arguments instead of resolving them inside the core library factory classes.

---

## 3. Test Coverage

### 🟡 Limited Test Suites
* **Status (2026-06):** `ClientRMQExchange.handleMessage` now has a spec covering both
  call overloads (added with the callback-resolution fix).
* **Remaining:** Add tests for `ServerRMQ`, `ErrorSerializer`, and `ErrorDeserializer`
  (verify serialization, exchange setup, connection lifecycle, and exception
  deserialization behavior, including the malformed-JSON `Unknown` case).
