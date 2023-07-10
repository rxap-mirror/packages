import { WriterFunction } from 'ts-morph';

export interface NestProviderObject {
  provide: string | WriterFunction;
  useClass?: string | WriterFunction;
  scope?: '0' | '1' | '2';
  useFactory?: string | WriterFunction;
  inject?: string[] | WriterFunction;
  useExisting?: string | WriterFunction;
  useValue?: string | WriterFunction;
}
