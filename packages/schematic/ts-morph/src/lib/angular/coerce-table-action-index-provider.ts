import {
  TsMorphAngularProjectTransform,
  TsMorphAngularProjectTransformOptions,
} from '../ts-morph-transform';
import {
  AddComponentProvider,
  CoerceSourceFile,
} from '@rxap/schematics-ts-morph';
import { CoerceImports } from '../ts-morph/coerce-imports';

export interface CoerceTableActionIndexProviderOptions extends TsMorphAngularProjectTransformOptions {
  tableName: string;
}

export function CoerceTableActionIndexProviderRule(options: Readonly<CoerceTableActionIndexProviderOptions>) {
  let {
    tableName,
    directory,
    project,
    feature,
  } = options;
  if (directory?.endsWith('/methods/action')) {
    directory = directory.replace('/methods/action', '');
  }
  return TsMorphAngularProjectTransform({
    project,
    feature,
    directory,
  }, (project) => {

    const sourceFile = CoerceSourceFile(project, `${ tableName }.component.ts`);

    AddComponentProvider(sourceFile, 'TABLE_ROW_ACTION_METHODS');
    CoerceImports(sourceFile, {
      namedImports: [ 'TABLE_ROW_ACTION_METHODS' ],
      moduleSpecifier: './methods/action',
    });

  });

}
