import {
  TsMorphAngularProjectTransform,
  TsMorphAngularProjectTransformOptions,
} from '../ts-morph-transform';
import { CoerceSourceFile } from '../coerce-source-file';
import { CoerceVariableDeclaration } from '../coerce-variable-declaration';

export type CoerceTableActionIndexOptions = TsMorphAngularProjectTransformOptions

export function CoerceTableActionIndexRule(options: CoerceTableActionIndexOptions) {

  return TsMorphAngularProjectTransform(options, (project) => {

    const sourceFile = CoerceSourceFile(project, 'index.ts');

    CoerceVariableDeclaration(sourceFile, 'TABLE_ROW_ACTION_METHODS', {
      initializer: '[]',
    });


  });

}
