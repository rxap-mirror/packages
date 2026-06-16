# TODO: @rxap/nest-socket-io-client

Here are the identified improvements and critical bug fixes for the `nest-socket-io-client` library:

## 1. High Coupling to Environment Config Keys
In `socket-io-client.provider.ts` (lines 63-67), the client provider is directly coupled to specific environment variable keys:
```typescript
this.config.getOrThrow('COORDINATOR_SOCKET')
this.config.getOrThrow('COORDINATOR_JWT')
```
- **Issue:** This makes `@rxap/nest-socket-io-client` a highly single-purpose, non-reusable module. If another app wants to use this package to connect to a different Socket.IO server, they are forced to use the same keys or rewrite the code.
- **Action:** Refactor `SocketIoClientModule` into a dynamic module (e.g., using `forRoot` / `forRootAsync` or dynamic options providers) so that the socket host URL and Authorization token can be injected or configured dynamically rather than hardcoding environment names.

## 2. Test Coverage
- **Issue:** No tests were found.
- **Action:** Add unit tests to mock the Socket.IO client and verify that `SocketIoClientProxyService` and `SocketIoClientStrategy` correctly route events, map patterns, and correctly clear listeners on teardown (verifying the fix for item #1).
