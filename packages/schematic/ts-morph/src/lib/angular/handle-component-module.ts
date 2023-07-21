import { SourceFile } from 'ts-morph';
import { ToValueContext } from '../to-value-context';

export interface HandleComponentModule {
  handleComponentModule(context: ToValueContext & { sourceFile: SourceFile }): void;
}
