import { SourceFile } from 'ts-morph';
import { ToValueContext } from '../to-value-context';

export interface HandleComponent {
  handleComponent(context: ToValueContext & { sourceFile: SourceFile }): void;
}
