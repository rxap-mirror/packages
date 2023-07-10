import { Builder } from './builder';

export interface BuildersJson {
  /** Link to schema. */
  $schema?: string;
  builders: Record<string, Builder>;
}
