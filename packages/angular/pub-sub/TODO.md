# TODO: @rxap/ngx-pub-sub Refactoring & Bug Fixes

This document outlines the findings of the project audit for `@rxap/ngx-pub-sub` (`packages/angular/pub-sub`). It categorizes issues by severity and provides concrete recommendations for resolving them.

---

## 📐 Architectural Debt & Code Quality

### 1. Reverse Chronological Replay Order
In `packages/angular/pub-sub/src/lib/pub-sub.service.ts`:
```typescript
  public getFromCache<T = unknown>(topic: string, limit = 0): Array<MessageMetaData<T>> {
    const messages: Array<MessageMetaData<T>> = [];
    for (let i = this.cache.length - 1; i >= 0; i--) {
      const message = this.cache[i];
      if (this.topicMatch(message.topic, topic)) {
        messages.push(message.metadata as MessageMetaData<T>);
        if (limit && messages.length >= limit) {
          break;
        }
      }
    }
    return messages;
  }
```
* **Issue:** Since the loop starts from the end of the cache (`this.cache.length - 1`) and pushes to `messages`, replayed cached messages are returned (and emitted via `subscribe`) in **reverse chronological order** (newest first). Usually, subscriber components expect replayed historical messages to be chronological.
* **Fix:** Reverse the array before returning:
  ```typescript
  return messages.reverse();
  ```

### 2. Manual/Insecure UUID Generation
In `packages/angular/pub-sub/src/lib/message-meta-data.ts`:
* **Issue:** The `uuid` generation uses a custom `Math.random()`-based generator. `Math.random()` is not cryptographically secure and can cause ID collisions or poor performance.
* **Fix:** Use standard modern Web API `crypto.randomUUID()` which is widely supported in Node.js 14.17+ and standard browsers.

---

## 🧪 Test Suite Flaws

The test suite in `packages/angular/pub-sub/src/lib/pub-sub.service.spec.ts` passes successfully but contains hidden flaws:

### 1. False Positive in GC Startup Verification
```typescript
    it('should start the garbage collector', () => {
      expect(Reflect.get(service, 'garbageCollectorSubscription')).toBeDefined();
    });
```
* **Issue:** `garbageCollectorSubscription` is initialized as `null`. In Jest/Jasmine, `toBeDefined()` passes for `null` (since `null` is defined, only `undefined` is not). This test passed even though the subscription was `null` and the garbage collector failed to start.
* **Fix:** Use `expect(Reflect.get(service, 'garbageCollectorSubscription')).not.toBeNull();` or `toBeInstanceOf(Subscription)`.

### 2. No Assertion on Message Replay Order
* **Issue:** Tests assert that the correct number of replayed messages is received, but not the order of emission.
* **Fix:** Add assertions verifying that replayed messages are emitted in chronological order.

### 3. Missing Coverage for Configuration Functions
* **Issue:** No unit tests exist for `withMaxCacheSize` or `withGarbageCollectorInterval`, which is why their provider mapping bugs were not detected during local test runs.
* **Fix:** Implement unit tests validating that each configuration provider overrides the correct injection token.
