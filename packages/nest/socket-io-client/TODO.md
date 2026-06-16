# TODO: @rxap/nest-socket-io-client

Here are the identified improvements and critical bug fixes for the `nest-socket-io-client` library:

## 1. Socket Listener Memory Leak (Critical Bug)
In `socket-io-client-proxy.service.ts` (lines 69-84), a new event listener is registered for every `publish()` call using a unique event string name. However, the teardown function tries to remove it by passing a new anonymous callback:
```typescript
const socket = this.client.getSocket().on(event, (data: unknown) => {
  callback({ response: data });
});

return () => socket.off(event, () => {
  this.logger.log('socket off', 'SocketIoClientProxyService');
});
```
- **Bug:** `socket.off(event, callback)` only removes a listener if the passed callback reference matches the registered one exactly. The arrow function passed inside `.off()` is an entirely new function, which means the original listener is **never** unregistered. This leads to a cumulative memory leak where event listeners pile up on the global socket instance with every single request sent.
- **Action:** Since `event` is uniquely generated for this specific request (`randomBytes(64)`), you can simply unregister *all* listeners for this specific event string without needing to supply the original callback reference:
  ```typescript
  return () => {
    socket.off(event);
    this.logger.log('socket off', 'SocketIoClientProxyService');
  };
  ```

## 2. Invalid Event Listener in `SocketIoClientStrategy` (Bug)
In `socket-io-client.strategy.ts` (lines 39-41), the strategy listens for a `'connection'` event:
```typescript
this.client.on('connection', () => {
  this.logger.log('connection', 'SocketIoClientStrategy');
});
```
- **Bug:** `'connection'` is a server-side event. A Socket.IO client (instance of `socket.io-client` `Socket`) never emits `'connection'`; it emits `'connect'` when it establishes a connection to the server. Consequently, this log message will never fire.
- **Action:** Change the listener to `'connect'`:
  ```typescript
  this.client.on('connect', () => {
    this.logger.log('connected', 'SocketIoClientStrategy');
  });
  ```

## 3. High Coupling to Environment Config Keys
In `socket-io-client.provider.ts` (lines 63-67), the client provider is directly coupled to specific environment variable keys:
```typescript
this.config.getOrThrow('COORDINATOR_SOCKET')
this.config.getOrThrow('COORDINATOR_JWT')
```
- **Issue:** This makes `@rxap/nest-socket-io-client` a highly single-purpose, non-reusable module. If another app wants to use this package to connect to a different Socket.IO server, they are forced to use the same keys or rewrite the code.
- **Action:** Refactor `SocketIoClientModule` into a dynamic module (e.g., using `forRoot` / `forRootAsync` or dynamic options providers) so that the socket host URL and Authorization token can be injected or configured dynamically rather than hardcoding environment names.

## 4. Test Coverage
- **Issue:** No tests were found.
- **Action:** Add unit tests to mock the Socket.IO client and verify that `SocketIoClientProxyService` and `SocketIoClientStrategy` correctly route events, map patterns, and correctly clear listeners on teardown (verifying the fix for item #1).
