import { ToValueContext } from './to-value-context';
import { SourceFile } from 'ts-morph';

export interface HandleComponentModule {
  handleComponentModule(context: ToValueContext & { sourceFile: SourceFile }): void;
}
