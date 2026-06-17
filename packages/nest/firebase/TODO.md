# nest-firebase Audit TODO List

This document lists findings, architectural debt, and recommended improvements identified during the audit of the `@rxap/nest-firebase` library.

---

## 🏛️ Architectural Debt & Code Quality

### 3. Redundant / Misleading Exception Handling in `FirebaseAuthGuard`
* **File**: `src/lib/firebase-auth.guard.ts` (Lines 86-93)
* **Problem**:
  The `canActivate` method wraps `this.validateIdToken(idToken)` in a `try...catch` block designed to throw an `InternalServerErrorException` on unexpected validation failures. However, `validateIdToken` already has its own `.catch()` block that intercepts all errors, logs them, and returns `null`. Thus, the guard's outer catch block is dead code, and token verification rejections will always lead to an `UnauthorizedException` (401), which is correct for expired/invalid tokens, but makes the outer catch block confusing and redundant.
* **Recommended Fix**:
  Simplify the flow. Alternatively, let `validateIdToken` throw when a system-level or configuration error occurs (e.g., Firebase Admin is not initialized or a network error occurs) and only return `null` for token signature/expiration verification failures. This ensures system/infrastructure issues can be properly escalated to a 500 error instead of being masked as a 401.

### 4. Incomplete Error Handling in `FirestoreErrorHandler`
* **File**: `src/lib/firestore/error-handler.ts` (Lines 41-57)
* **Problem**:
  - The logger statement `logger.error([ message, note ].join(': '));` may output trailing colons or `"undefined"` if `note` is not present in the error payload.
  - The switch block only handles error codes `2` (`UNKNOWN`) and `5` (`NOT_FOUND`). Other standard Firestore/gRPC status codes (like `7` for `PERMISSION_DENIED`, `6` for `ALREADY_EXISTS`, etc.) are caught and rethrown as generic `InternalServerErrorException` with code `500`, masking crucial API client details.
* **Recommended Fix**:
  - Handle a broader list of gRPC / Firestore error codes and map them to their corresponding NestJS/HTTP exceptions:
    - `3` (`INVALID_ARGUMENT`) -> `BadRequestException`
    - `6` (`ALREADY_EXISTS`) -> `ConflictException`
    - `7` (`PERMISSION_DENIED`) -> `ForbiddenException`
    - `8` (`RESOURCE_EXHAUSTED`) -> `HttpStatus.TOO_MANY_REQUESTS`
    - `16` (`UNAUTHENTICATED`) -> `UnauthorizedException`
  - Safeguard the array joining logic in logging:
    ```typescript
    logger.error([ message, note ].filter(Boolean).join(': '));
    ```

---

## 🧪 Test Coverage & Verification

### 5. Extremely Low Test Coverage
* **Problem**:
  Currently, the project only tests the basic functionality of `FirebaseAuthGuard`. There are absolutely no unit or integration tests for:
  - `FirebaseAppCheckGuard` (which would have immediately detected the `request.headers.get` error)
  - `FirestoreErrorHandler`
  - `initGenerator`
* **Recommended Fix**:
  - Add `firebase-app-check.guard.spec.ts` testing both deactivated and activated modes, mock-verifying headers.
  - Add `firestore/error-handler.spec.ts` verifying that different error codes map correctly to NestJS HTTP exceptions.
  - Add a generator test suite for `initGenerator` utilizing `@nx/devkit/testing` to check correct package relocations and peer dependency additions.
