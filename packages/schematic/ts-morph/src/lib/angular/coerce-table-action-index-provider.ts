import {
  TsMorphAngularProjectTransformOptions,
  TsMorphAngularProjectTransformRule,
} from '../ts-morph-transform';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { AddComponentProvider } from './add-component-provider';

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
  return TsMorphAngularProjectTransformRule({
    project,
    feature,
    directory,
  }, (project, [ sourceFile ]) => {

    AddComponentProvider(sourceFile, 'TABLE_ROW_ACTION_METHODS');
    CoerceImports(sourceFile, {
      namedImports: [ 'TABLE_ROW_ACTION_METHODS' ],
      moduleSpecifier: './methods/action',
    });

  }, [ `${ tableName }.component.ts` ]);

}
