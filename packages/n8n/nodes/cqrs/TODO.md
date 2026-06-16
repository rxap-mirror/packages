# TODO: @rxap/n8n-nodes-cqrs Audit & Refactoring Plan

This document outlines the critical bugs, architectural debt, library anti-patterns, and test coverage gaps discovered during the project audit of `n8n-nodes-cqrs`.

---

## 1. Critical Functional Bugs

### 🚨 Unhandled `JSON.parse` in Reply Queue Callback
* **File:** `src/lib/pattern-node.ts` (Line 131)
* **Description:** 
  In the `REPLY_QUEUE` direct reply-to consumer callback, incoming message content is parsed via `JSON.parse` without safety wrapping:
  ```typescript
  responseEmitter.next({
    correlationId: msg.properties.correlationId,
    payload: JSON.parse(msg.content.toString()),
  });
  ```
  If an upstream service replies with malformed JSON, a plain text error, binary data, or an empty body, `JSON.parse` will throw an unhandled exception. In an amqplib consumer, this can crash the consumer or cause unhandled promise rejections, interrupting other active node executions.
* **Recommended Fix:** Wrap with a `try/catch` and log or handle the error gracefully:
  ```typescript
  let payload: any;
  try {
    payload = JSON.parse(msg.content.toString());
  } catch (error) {
    this.logger.error(`Failed to parse reply message JSON: ${error.message}`);
    payload = { error: { message: 'Invalid JSON response from service', raw: msg.content.toString() } };
  }
  ```

### 🚨 Hanging Workflow Executions due to Missing Reply Timeouts
* **File:** `src/lib/pattern-node.ts` (Lines 179–215)
* **Description:** 
  When a node is configured with the `Wait for Reply` option, it waits for responses via `firstValueFrom` on a filtered Subject emitter. However, there is no timeout configured on this expectation. If a target microservice crashes, fails to process the message, or doesn't respond, the execution **hangs indefinitely**, leading to resource leaks, unresolved execution threads, and locked node resources.
* **Recommended Fix:** Apply a default or configurable timeout using the RxJS `timeout` operator, and map timeout errors to user-friendly messages:
  ```typescript
  import { timeout, catchError, throwError, TimeoutError } from 'rxjs';
  
  // Example timeout after 30 seconds
  replayQueuePromise.push(firstValueFrom(responseEmitter.pipe(
    takeUntil(cancel),
    filter(item => item.correlationId === correlationId),
    timeout(30000),
    catchError(err => {
      if (err instanceof TimeoutError) {
        returnItems[i] = {
          json: {},
          error: new NodeOperationError(this.getNode(), `Response timeout after 30000ms for correlationId: ${correlationId}`),
        };
      }
      return throwError(() => err);
    }),
    tap(item => { ... })
  )));
  ```

---

## 2. Architectural Debt & Resource Leaks

### ⚠️ RabbitMQ Connection / Channel Leak on Execution Failures
* **File:** `src/lib/pattern-node.ts` (Lines 103–251)
* **Description:** 
  `PatternNode.execute` opens a channel/connection, starts a publishing and reply-waiting loop, and closes the channel at the end of the method.
  If an exception is thrown in the loop (e.g., standard Node.js or `NodeOperationError` thrown during publishing failures or header parsing), execution halts and the method exits immediately. Because there is no `finally` block or overall `try/catch/finally` around the core processing, the connection and channel are **never closed**, leading to an accumulating connection leak on the RabbitMQ broker.
* **Recommended Fix:** Restructure `execute` to use a `try/finally` block to guarantee channel/connection closure:
  ```typescript
  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    let channel: Channel | undefined;
    try {
      channel = await rabbitmqConnectExchange.call(this, exchange, options);
      // ... core execution logic ...
      await Promise.allSettled(replayQueuePromise);
      return [ returnItems.filter(Boolean) ];
    } finally {
      if (channel) {
        try {
          await channel.close();
          await channel.connection.close();
        } catch (closeError: any) {
          this.logger.error(`Error closing RabbitMQ channel: ${closeError.message}`);
        }
      }
    }
  }
  ```

### ⚠️ Connection Leak in Promisification Helpers
* **File:** `src/lib/GenericFunctions.ts` (Lines 80–150)
* **Description:** 
  - In `rabbitmqCreateChannel`, if `connection.createChannel()` fails, the opened `connection` is leaked (never closed).
  - In `rabbitmqConnectQueue` and `rabbitmqConnectExchange`, if `channel.assertQueue`, `channel.bindQueue`, or `channel.assertExchange` throws, the promise is rejected, but the newly created `channel` and `connection` are left open.
* **Recommended Fix:** Ensure that if any assertion or setup step fails, the connection/channel is closed in the `catch` block before rejecting:
  ```typescript
  // Example for rabbitmqConnectQueue
  return await new Promise(async (resolve, reject) => {
    try {
      // ... setup ...
      resolve(channel);
    } catch (error) {
      if (channel) {
        try { await channel.close(); await channel.connection.close(); } catch {}
      }
      reject(error);
    }
  });
  ```

---

## 3. Generator Anti-patterns

### ⚠️ Physical Disk Path Usage in Virtualized Tree Context
* **File:** `src/generators/init/generator.ts` (Lines 11–14)
* **Description:** 
  The `init` generator attempts to compute the path to `package.json` relative to the physical compiled file's directory `__dirname`:
  ```typescript
  const packageJsonFilePath = relative(
    tree.root,
    join(__dirname, '..', '..', '..', 'package.json')
  );
  ```
  It then attempts to read/verify this path on the virtual `Tree`.
  This violates the virtual filesystem abstraction in Nx:
  - If generators are executed from a virtual test harness, `__dirname` relative calculations won't map correctly to files inside the virtual tree.
  - Relying on physical directory structures causes fragile builds when files are compiled, bundled, or relocated in the monorepo structure.
* **Recommended Fix:** Retrieve the package's package.json path using standard monorepo path helpers, or locate it relative to the workspace root using known project configurations/conventions without relying on compiled `__dirname` structures.

### ⚠️ Dynamic `require` inside Virtual Tree Generators
* **File:** `src/generators/init/generator.ts` (Lines 125–130)
* **Description:** 
  The generator dynamically calls `require` on files from `node_modules` during execution. This bypasses the virtual filesystem safety checks of the Nx `Tree` and can trigger unexpected exceptions if the packages are not yet installed or are laid out differently on the physical disk.
* **Recommended Fix:** Perform dynamic imports inside `try/catch` blocks and supply high-quality diagnostic messages if a dynamic module load fails.

---

## 4. Test Coverage

### ⚠️ Zero Test Suite Coverage
* **Status:** No tests found (0% coverage).
* **Description:** 
  There are currently no unit, integration, or schematic test files defined for this project. Because the package manages critical messaging architectures (commands, queries, events), reliability is paramount.
* **Recommended Fix:**
  1. Add unit tests for `MessageTracker` under `src/lib/GenericFunctions.spec.ts` to verify correct addition, removal, and graceful closing of active delivery tags.
  2. Add mock tests for `PatternNode` and `PatternTriggerNode` to verify message publishing, exchange assertion, and reply emitter filtering.
  3. Add a unit test for `initGenerator` to ensure correct virtual Tree operations.
