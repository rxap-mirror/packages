import { WriterFunction } from 'ts-morph';

/**
 * Interface representing a NestJS provider object.
 */
export interface NestProviderObject {
  /**
   * The injection token.
   */
  provide: string | WriterFunction;
  /**
   * Class to instantiate.
   */
  useClass?: string | WriterFunction;
  /**
   * Scope of the provider (0=DEFAULT, 1=TRANSIENT, 2=REQUEST).
   */
  scope?: '0' | '1' | '2';
  /**
   * Factory function.
   */
  useFactory?: string | WriterFunction;
  /**
   * Dependencies for the factory.
   */
  inject?: string[] | WriterFunction;
  /**
   * Alias for an existing provider.
   */
  useExisting?: string | WriterFunction;
  /**
   * Static value.
   */
  useValue?: string | WriterFunction;
}
