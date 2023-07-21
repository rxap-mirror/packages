import { CoerceSourceFile } from '../coerce-source-file';
import { CoerceVariableDeclaration } from '../coerce-variable-declaration';
import {
  TsMorphAngularProjectTransformOptions,
  TsMorphAngularProjectTransformRule,
} from '../ts-morph-transform';

export type CoerceTableActionIndexOptions = TsMorphAngularProjectTransformOptions

export function CoerceTableActionIndexRule(options: CoerceTableActionIndexOptions) {

  return TsMorphAngularProjectTransformRule(options, (project) => {

    const sourceFile = CoerceSourceFile(project, 'index.ts');

    CoerceVariableDeclaration(sourceFile, 'TABLE_ROW_ACTION_METHODS', {
      initializer: '[]',
    });


  });

}
