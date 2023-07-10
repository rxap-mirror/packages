import {ToValueContext} from './to-value-context';
import {SourceFile} from 'ts-morph';

export interface HandleComponent {
  handleComponent(context: ToValueContext & { sourceFile: SourceFile }): void;
}
