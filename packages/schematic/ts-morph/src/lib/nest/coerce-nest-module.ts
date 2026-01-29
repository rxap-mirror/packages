import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import { CoerceNestModuleImport } from '@rxap/ts-morph';
import {
  classify,
  dasherize,
} from '@rxap/utilities';
import {
  buildNestProjectName,
  GetProject,
  GetProjectSourceRoot,
  IsApplicationProject,
  IsLibraryProject,
  IsNestJsProject,
} from '@rxap/workspace-utilities';
import {
  join,
  relative,
} from 'path';
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
  backend: { project?: string | null, kind?: any } | undefined;
}

export function CoerceNestModule(options: CoerceNestModuleOptions): Rule {
  const {
    name,
    project,
    feature,
    shared,
    directory,
    backend,
  } = options;
  let { tsMorphTransform } = options;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  tsMorphTransform ??= () => {};
  const moduleName = classify(name) + 'Module';
  const moduleFile = `${ dasherize(name) }.module.ts`;
  const moduleFilePath = directory ? join(directory, moduleFile) : moduleFile;
  return chain([
    AssertNestProject({
      project,
      feature,
      shared,
      backend,
    }),
    TsMorphNestProjectTransformRule(
      {
        project,
        feature,
        shared,
        directory,
        backend,
      },
      (project, [ sourceFile ]) => {
        const classDeclaration = CoerceClass(sourceFile, moduleName, {
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
      [ `${ moduleFile }?` ],
    ),
    tree => {
      const nestProject = GetProject(tree, buildNestProjectName(options));
      if (name !== 'app' && IsNestJsProject(nestProject)) {
        if (IsApplicationProject(nestProject)) {
          return AddNestModuleToAppModule({
            project,
            feature,
            shared,
            name,
            directory,
            backend,
          });
        }
        if (IsLibraryProject(nestProject)) {
          const projectSourceRoot = GetProjectSourceRoot(nestProject) + '/lib';
          const moduleFiles = tree
            .getDir(projectSourceRoot)
            .subfiles
            .filter(file => file.endsWith('.module.ts'))
            .filter(file => !file.endsWith(moduleFile));
          if (moduleFiles.length > 0) {
            const moduleFile = moduleFiles[0];
            return TsMorphNestProjectTransformRule(
              {
                project,
                feature,
                shared,
                backend,
              },
              (project, [ sourceFile ]) => {
                CoerceNestModuleImport(sourceFile, {
                  moduleName,
                  moduleSpecifier: relative(moduleFile, moduleFilePath).replace(/\.ts$/, ''),
                });
              }, [moduleFile]);
          }
        }
      }
      return noop();
    },
  ]);
}
