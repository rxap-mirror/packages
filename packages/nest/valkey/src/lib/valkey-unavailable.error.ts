import { redactSecrets } from './redact';

/**
 * Thrown by the fail-closed APIs (lock API, idempotency keys) when Valkey cannot
 * be reached or a command fails. Callers should answer with HTTP 503 instead of
 * treating the situation as "lock free" / "key absent".
 */
export class ValkeyUnavailableError extends Error {
  readonly code = 'VALKEY_UNAVAILABLE';

  constructor(
    readonly operation: string,
    cause?: unknown
  ) {
    const detail = cause instanceof Error ? cause.message : cause !== undefined ? String(cause) : '';
    super(
      redactSecrets(
        `Valkey unavailable during ${operation}${detail ? `: ${detail}` : ''}`
      )
    );
    this.name = 'ValkeyUnavailableError';
    // Standard `Error.cause` set at runtime: the lib target (es2021) does not type it.
    Object.defineProperty(this, 'cause', { value: cause, enumerable: false, writable: true, configurable: true });
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
