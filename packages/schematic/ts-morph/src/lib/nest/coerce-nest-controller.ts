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
  WriterFunction,
} from 'ts-morph';
import { CoerceClass } from '../coerce-class';
import {
  TsMorphNestProjectTransformOptions,
  TsMorphNestProjectTransformRule,
} from '../ts-morph-transform';
import { CoerceDecorator } from '../ts-morph/coerce-decorator';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { AddNestModuleController } from './add-nest-module-controller';
import { AssertNestProject } from './assert-nest-project';
import { CoerceNestModule } from './coerce-nest-module';

export interface CoerceNestControllerOptions extends TsMorphNestProjectTransformOptions {
  name: string;
  nestModule?: string;
  controllerPrefix?: string;
  coerceModule?: boolean;
  tsMorphTransform?: (
    project: Project,
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
    options: CoerceNestControllerOptions,
  ) => void;
  skipModuleImport?: boolean;
  overwrite?: boolean;
}

export function CoerceNestController(
  options: CoerceNestControllerOptions,
): Rule {
  const {
    project,
    feature,
    shared,
    controllerPrefix,
    directory,
    coerceModule,
    skipModuleImport,
    overwrite,
  } = options;
  let { name, tsMorphTransform, nestModule } = options;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  tsMorphTransform ??= () => {};
  name = dasherize(name);
  nestModule ??= name;
  return chain([
    AssertNestProject({ project, feature, shared }),
    coerceModule ? CoerceNestModule({
      project,
      feature,
      shared,
      name: nestModule!,
      directory,
    }) : noop(),
    TsMorphNestProjectTransformRule(
      {
        project,
        feature,
        shared,
        directory,
      },
      (project, [ controllerSourceFile, moduleSourceFile ]) => {
        const controllerDecoratorArguments: WriterFunction[] = controllerPrefix ?
          [ w => w.quote(controllerPrefix) ] :
          [];
        const classDeclaration = CoerceClass(controllerSourceFile, classify(name) + 'Controller', {
          isExported: true,
          decorators: [
            {
              name: 'Controller',
              arguments: controllerDecoratorArguments,
            },
          ],
        });
        if (overwrite) {
          CoerceDecorator(classDeclaration, 'Controller').set({
            arguments: controllerDecoratorArguments,
          });
        }
        CoerceImports(controllerSourceFile, [
          {
            namedImports: [ 'Controller' ],
            moduleSpecifier: '@nestjs/common',
          },
        ]);
        if (!skipModuleImport) {
          if (moduleSourceFile.getClass(classify(nestModule!) + 'Module')) {
            AddNestModuleController(moduleSourceFile, classify(name) + 'Controller', [
              {
                namedImports: [ classify(name) + 'Controller' ],
                moduleSpecifier: './' + dasherize(name) + '.controller',
              },
            ]);
          }
        }
        tsMorphTransform!(project, controllerSourceFile, classDeclaration, options);
      },
      [
        `${ dasherize(name) }.controller.ts?`,
        `${ dasherize(nestModule!) }.module.ts?`,
      ],
    ),
  ]);
}
