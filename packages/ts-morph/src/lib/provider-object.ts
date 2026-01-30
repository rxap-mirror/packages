import { WriterFunction } from 'ts-morph';

/**
 * Represents a dependency injection provider object structure.
 * Compatible with Angular and NestJS provider definitions.
 */
export interface ProviderObject {
  /**
   * The injection token or class name to provide.
   * Can be a string string literal or a writer function.
   */
  provide: string | WriterFunction;
  /**
   * Class to instantiate for the token.
   */
  useClass?: string | WriterFunction;
  /**
   * Factory function to produce the value.
   */
  useFactory?: string | WriterFunction;
  /**
   * List of dependencies to inject into the factory.
   */
  deps?: string[] | WriterFunction;
  /**
   * Existing token to alias.
   */
  useExisting?: string | WriterFunction;
  /**
   * Static value to use.
   */
  useValue?: string | WriterFunction;
  /**
   * If true, allows multiple providers for the same token.
   */
  multi?: boolean;
}
