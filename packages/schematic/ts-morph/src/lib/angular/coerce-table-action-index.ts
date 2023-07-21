import {
  TsMorphAngularProjectTransform,
  TsMorphAngularProjectTransformOptions,
} from '../ts-morph-transform';
import {
  CoerceSourceFile,
  CoerceVariableDeclaration,
} from '@rxap/schematics-ts-morph';

export type CoerceTableActionIndexOptions = TsMorphAngularProjectTransformOptions

export function CoerceTableActionIndexRule(options: CoerceTableActionIndexOptions) {

  return TsMorphAngularProjectTransform(options, (project) => {

    const sourceFile = CoerceSourceFile(project, 'index.ts');

    CoerceVariableDeclaration(sourceFile, 'TABLE_ROW_ACTION_METHODS', {
      initializer: '[]',
    });


  });

}
