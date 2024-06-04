import { CoerceSuffix } from '@rxap/schematics-utilities';
import {
  CoerceDataSourceClass as NEW_CoerceDataSourceClass,
  CoerceDataSourceClassOptions as NEW_CoerceDataSourceClassOptions,
} from '@rxap/ts-morph';
import { noop } from '@rxap/utilities';
import { TsMorphAngularProjectTransformOptions } from '@rxap/workspace-ts-morph';
import {
  ClassDeclaration,
  Project,
  SourceFile,
} from 'ts-morph';
import { TsMorphAngularProjectTransformRule } from '../ts-morph-transform';

export interface CoerceDataSourceClassOptions extends TsMorphAngularProjectTransformOptions, NEW_CoerceDataSourceClassOptions {
  tsMorphTransform?: (project: Project, sourceFile: SourceFile, classDeclaration: ClassDeclaration) => void;
}

export function CoerceDataSourceClass(options: CoerceDataSourceClassOptions) {
  const {
    name,
    tsMorphTransform = noop,
  } = options;

  return TsMorphAngularProjectTransformRule(options, (project, [ sourceFile ]) => {
    const classDeclaration = NEW_CoerceDataSourceClass(sourceFile, options);
    tsMorphTransform(project, sourceFile, classDeclaration);
  }, [CoerceSuffix(name, '.data-source.ts') + '?']);
}
