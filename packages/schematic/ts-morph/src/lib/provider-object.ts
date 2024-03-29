import { WriterFunction } from 'ts-morph';

/**
 * @deprecated import from @rxap/ts-morph
 */
export interface ProviderObject {
  provide: string | WriterFunction;
  useClass?: string | WriterFunction;
  useFactory?: string | WriterFunction;
  deps?: string[] | WriterFunction;
  useExisting?: string | WriterFunction;
  useValue?: string | WriterFunction;
  multi?: boolean;
}
