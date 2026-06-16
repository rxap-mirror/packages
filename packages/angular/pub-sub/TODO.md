# TODO: @rxap/ngx-pub-sub Refactoring & Bug Fixes

This document outlines the findings of the project audit for `@rxap/ngx-pub-sub` (`packages/angular/pub-sub`). It categorizes issues by severity and provides concrete recommendations for resolving them.

---

## 🚨 Critical Bugs

### 1. Garbage Collector Never Starts (`startGarbageCollector` Early Return)
In `packages/angular/pub-sub/src/lib/pub-sub.service.ts`:
```typescript
  public startGarbageCollector() {
    this.garbageCollectorInitialized = true;
    if (this.garbageCollectorInitialized) {
      console.warn('Garbage collector is already initialized');
      return;
    }
    // ... rest of the code is never reached
  }
```
* **Issue:** `this.garbageCollectorInitialized = true` is set **before** checking if it is true. Consequently, the condition `if (this.garbageCollectorInitialized)` is *always* met, resulting in an early return. The interval subscription is never created, and the garbage collector never runs.
* **Impact:** High memory consumption or retention policy bypass. Cache size is never managed periodically via the interval because the interval is never scheduled.
* **Fix:** Update the check order:
  ```typescript
  public startGarbageCollector() {
    if (this.garbageCollectorInitialized) {
      console.warn('Garbage collector is already initialized');
      return;
    }
    this.garbageCollectorInitialized = true;
    // ... schedule interval subscription
  }
  ```

### 2. Broken Configuration Token Mappings in Providers
In `packages/angular/pub-sub/src/lib/provide.ts`:
```typescript
export function withMaxCacheSize(size: number): Provider {
  return {
    provide: RXAP_PUB_SUB_DISABLE_CACHE, // <-- BUG: Binds to DISABLE_CACHE instead of CACHE_SIZE
    useValue: size,
  };
}

export function withGarbageCollectorInterval(interval: number): Provider {
  return {
    provide: RXAP_PUB_SUB_DISABLE_GARBAGE_COLLECTOR, // <-- BUG: Binds to DISABLE_GARBAGE_COLLECTOR instead of INTERVAL
    useValue: interval,
  };
}
```
* **Issue:**
  * `withMaxCacheSize` maps to the `RXAP_PUB_SUB_DISABLE_CACHE` token instead of `RXAP_PUB_SUB_CACHE_SIZE`. This causes cache to be disabled (since the non-zero size evaluates to truthy) and the custom size is never configured.
  * `withGarbageCollectorInterval` maps to the `RXAP_PUB_SUB_DISABLE_GARBAGE_COLLECTOR` token instead of `RXAP_PUB_SUB_GARBAGE_COLLECTOR_INTERVAL`. This causes the garbage collector to be disabled entirely (since the interval value evaluates to truthy) and the custom interval is never configured.
* **Impact:** Developers trying to customize the cache size or the GC interval will silently break/disable the respective cache and garbage collector subsystems completely.
* **Fix:** Correct the tokens being provided:
  ```typescript
  export function withMaxCacheSize(size: number): Provider {
    return {
      provide: RXAP_PUB_SUB_CACHE_SIZE,
      useValue: size,
    };
  }

  export function withGarbageCollectorInterval(interval: number): Provider {
    return {
      provide: RXAP_PUB_SUB_GARBAGE_COLLECTOR_INTERVAL,
      useValue: interval,
    };
  }
  ```

### 3. Mutating Array During Iteration (`runGarbageCollector`)
In `packages/angular/pub-sub/src/lib/pub-sub.service.ts`:
```typescript
  public runGarbageCollector() {
    const now = Date.now();
    this.cache.forEach((message, index) => {
      if (message.retention) {
        const diff = now - message.metadata.timestamp;
        if (diff > message.retention) {
          this.cache.splice(index, 1);
        }
      }
    });
  }
```
* **Issue:** Modifying an array via `splice(index, 1)` during a `forEach` loop shifts subsequent elements down, causing indices to shift and elements to be skipped during iteration.
* **Impact:** Some expired messages in the cache will not be evaluated or pruned in a given garbage collection run.
* **Fix:** Iterate backward through the cache or filter the cache safely:
  ```typescript
  public runGarbageCollector() {
    const now = Date.now();
    for (let i = this.cache.length - 1; i >= 0; i--) {
      const message = this.cache[i];
      if (message.retention) {
        const diff = now - message.metadata.timestamp;
        if (diff > message.retention) {
          this.cache.splice(i, 1);
        }
      }
    }
  }
  ```

### 4. Broken Package Name Checking in Schematic/Generator
In `packages/angular/pub-sub/src/generators/init/generator.ts`:
```typescript
  if (
    !isDevDependency && [
      /^@rxap\/plugin/,
      /^@rxap\/workspace/,
      /@rxap\/schematic/,
    ]
  ) {
    // ...
  }
```
* **Issue:** The array of regular expressions is evaluated as a truthy standalone expression because `.some(...)` or `.test(...)` is missing.
* **Impact:** Every non-dev dependency, regardless of whether it matches the regex, is automatically moved to `devDependencies` during `initGenerator` execution, which can corrupt package setups.
* **Fix:** Wrap with `.some()`:
  ```typescript
  if (
    !isDevDependency &&
    [/^@rxap\/plugin/, /^@rxap\/workspace/, /@rxap\/schematic/].some((rx) => rx.test(packageName))
  ) {
    // ...
  }
  ```

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
