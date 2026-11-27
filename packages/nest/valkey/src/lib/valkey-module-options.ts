import type { ConnectionOptions } from 'tls';

export interface ValkeyModuleOptions {
  host?: string;
  port?: number;
  password?: string;
  /**
   * Connection URL (`redis://` or `rediss://`). Takes precedence over host/port;
   * an explicit `password` still overrides a password embedded in the URL.
   */
  url?: string;
  /** `true` enables TLS with default settings, an object is passed to `tls.connect`. */
  tls?: boolean | ConnectionOptions;
}
