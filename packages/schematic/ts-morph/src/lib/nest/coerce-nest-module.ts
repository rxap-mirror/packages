import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import {
  classify,
  dasherize,
} from '@rxap/utilities';
import {
  ClassDeclaration,
  Project,
  SourceFile,
} from 'ts-morph';
import { CoerceClass } from '../coerce-class';
import {
  TsMorphNestProjectTransformOptions,
  TsMorphNestProjectTransformRule,
} from '../ts-morph-transform';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { AddNestModuleToAppModule } from './add-nest-module-to-app-module';
import { AssertNestProject } from './assert-nest-project';

export interface CoerceNestModuleOptions extends TsMorphNestProjectTransformOptions {
  name: string;
  tsMorphTransform?: (project: Project, sourceFile: SourceFile, classDeclaration: ClassDeclaration) => void;
}

export function CoerceNestModule(options: CoerceNestModuleOptions): Rule {
  const {
    name,
    project,
    feature,
    shared,
    directory,
  } = options;
  let { tsMorphTransform } = options;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  tsMorphTransform ??= () => {};
  return chain([
    AssertNestProject({
      project,
      feature,
      shared,
    }),
    TsMorphNestProjectTransformRule(
      {
        project,
        feature,
        shared,
        directory,
      },
      (project, [ sourceFile ]) => {
        const classDeclaration = CoerceClass(sourceFile, classify(name) + 'Module', {
          isExported: true,
          decorators: [
            {
              name: 'Module',
              arguments: [ '{}' ],
            },
          ],
        });
        CoerceImports(sourceFile, [
          {
            namedImports: [ 'Module' ],
            moduleSpecifier: '@nestjs/common',
          },
        ]);

        tsMorphTransform!(project, sourceFile, classDeclaration);
      },
      [ `${ dasherize(name) }.module.ts?` ],
    ),
    name !== 'app' ? AddNestModuleToAppModule({
      project,
      feature,
      shared,
      name,
      directory,
    }) : noop(),
  ]);
}
