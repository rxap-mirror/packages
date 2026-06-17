# TODO: nest-rabbitmq Library Audit & Improvements

This document lists the findings, architectural debt, logic bugs, and recommended improvements identified during the audit of the `@rxap/nest-rabbitmq` package.

---

## 1. Architectural Debt

### 📋 Hardcoded Environment Variable Keys (Tight Coupling)
* **Files:** [rabbitmq-options-factory.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/rabbitmq/src/lib/rabbitmq-options-factory.ts), [client-rmq-exchange-module-options-factory.ts](file:///mnt/mmuenker/Projects/rxap/packages/packages/nest/rabbitmq/src/lib/client-rmq-exchange-module-options-factory.ts)
* **Description:** The classes directly hardcode and access environment variables like `RABBITMQ_EXCHANGE_NAME`, `RABBITMQ_EXCHANGE_TYPE`, `RABBITMQ_DISABLED`, `RABBITMQ_HOST`, `RABBITMQ_PORT`, `RABBITMQ_VHOST`, `RABBITMQ_USERNAME`, `RABBITMQ_PASSWORD`, and `RABBITMQ_URI`. This couples the library tightly to global env names, preventing a consumer from instantiating multiple distinct RabbitMQ clients with different credentials or options.
* **Recommended Fix:** Accept configuration structures/options via an injected configuration token or pass them directly as constructor arguments instead of resolving them inside the core library factory classes.

---

## 2. Test Coverage

### 🟡 Limited Test Suites
* **Status (2026-06):** `ClientRMQExchange.handleMessage` now has a spec covering both
  call overloads (added with the callback-resolution fix).
* **Remaining:** Add tests for `ServerRMQ`, `ErrorSerializer`, and `ErrorDeserializer`
  (verify serialization, exchange setup, connection lifecycle, and exception
  deserialization behavior, including the malformed-JSON `Unknown` case).
