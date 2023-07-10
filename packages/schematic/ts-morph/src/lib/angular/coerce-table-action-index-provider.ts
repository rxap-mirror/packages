import {
  TsMorphAngularProjectTransform,
  TsMorphAngularProjectTransformOptions,
} from '../ts-morph-transform';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceSourceFile } from '../coerce-source-file';
import { AddComponentProvider } from '../add-component-provider';

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
