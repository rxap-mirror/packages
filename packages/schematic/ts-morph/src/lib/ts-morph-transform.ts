import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import {
  IndentationText,
  Project,
  ProjectOptions,
  QuoteKind,
  SourceFile,
} from 'ts-morph';
import { deepMerge } from '@rxap/schematics-utilities';
import { AddDir } from './add-dir';
import {
  CoerceNestServiceProject,
  CoerceNestServiceProjectOptions,
} from './nest/coerce-nest-service-project';
import {
  BuildAngularBasePath,
  BuildAngularBasePathOptions,
} from './angular/build-angular-base-path';
import { BuildNestBasePath } from './nest/build-nest-base-path';
import { ApplyTsMorphProject } from './ts-morph/apply-ts-morph-project';
import { DirEntry } from '@angular-devkit/schematics/src/tree/interface';
import { join } from 'path';

export type TsMorphTransformCallback = ((project: Project, sourceFile: undefined) => void) |
  ((project: Project, sourceFile: SourceFile) => void) |
  ((project: Project, sourceFile: SourceFile[]) => void);

export function TsMorphTransform(
  sourceRoot: string,
  cb: (project: Project, sourceFile: SourceFile[]) => void,
  options?: Partial<ProjectOptions>,
  filePath?: string[],
): Rule
export function TsMorphTransform(
  sourceRoot: string,
  cb: (project: Project, sourceFile: SourceFile) => void,
  options?: Partial<ProjectOptions>,
  filePath?: string,
): Rule
export function TsMorphTransform(
  sourceRoot: string,
  cb: (project: Project, sourceFile: undefined) => void,
  options?: Partial<ProjectOptions>,
  filePath?: undefined,
): Rule
export function TsMorphTransform(
  sourceRoot: string,
  cb: TsMorphTransformCallback,
  options: Partial<ProjectOptions> = {},
  filePathFilter?: undefined | string | string[],
): Rule {
  return tree => {

    const filePath = filePathFilter ?
      Array.isArray(filePathFilter) ?
        filePathFilter.map(f => f.replace(/\?$/, '')) :
        [ filePathFilter.replace(/\?$/, '') ] :
      undefined;

    const project = new Project(deepMerge({
      manipulationSettings: {
        indentationText: IndentationText.TwoSpaces,
        quoteKind: QuoteKind.Single,
      },
      useInMemoryFileSystem: true,
    }, options));

    AddDir(tree.getDir(sourceRoot), project, undefined, filePath ?
      (fileName, dir: DirEntry) => {
        const fullPath = join(dir.path, fileName);
        return filePath.some(f => fullPath.endsWith(f));
      } :
      undefined);

    let sourceFile: SourceFile | SourceFile[] | undefined = undefined;

    if (filePath) {
      if (Array.isArray(filePath)) {
        sourceFile = filePath.map((f, index) => {
          let sf = project.getSourceFile(f);
          if (!sf) {
            if (Array.isArray(filePathFilter)) {
              if (filePathFilter[index]?.endsWith('?')) {
                sf = project.createSourceFile(f, '');
              } else {
                console.log(project.getSourceFiles().map(f => f.getFilePath()));
                throw new Error(`The file ${ f } does not exists with the source root ${ sourceRoot }`);
              }
            } else {
              if (index !== 0) {
                throw new Error('FATAL: The filePathFilter is not an array and the index is not 0');
              }
              if (filePathFilter?.endsWith('?')) {
                sf = project.createSourceFile(f, '');
              } else {
                throw new Error(`The file ${ f } does not exists with the source root ${ sourceRoot }`);
              }
            }
          }
          return sf;
        });
        if (!Array.isArray(filePathFilter)) {
          sourceFile = sourceFile[0];
        }
      }
    }

    cb(project, sourceFile as any);

    return ApplyTsMorphProject(project, sourceRoot, false);
  };
}

export interface TsMorphNestProjectTransformOptions extends CoerceNestServiceProjectOptions {
  directory?: string;
  projectOptions?: Partial<ProjectOptions>;
}

export function TsMorphNestProjectTransform(
  options: Readonly<TsMorphNestProjectTransformOptions>,
  cb: (project: Project, sourceFile: SourceFile[]) => void,
  filePath: string[],
): Rule
export function TsMorphNestProjectTransform(
  options: Readonly<TsMorphNestProjectTransformOptions>,
  cb: (project: Project, sourceFile: SourceFile) => void,
  filePath: string,
): Rule
export function TsMorphNestProjectTransform(
  options: Readonly<TsMorphNestProjectTransformOptions>,
  cb: (project: Project, sourceFile: undefined) => void,
  filePath?: undefined,
): Rule
export function TsMorphNestProjectTransform(
  options: Readonly<TsMorphNestProjectTransformOptions>,
  cb: TsMorphTransformCallback,
  filePath?: undefined | string | string[],
): Rule {
  return chain([
    CoerceNestServiceProject(options),
    tree => {
      const basePath = BuildNestBasePath(tree, options);
      return TsMorphTransform(
        basePath,
        cb,
        options.projectOptions,
        filePath as any,
      );
    },
  ]);
}

export interface TsMorphAngularProjectTransformOptions extends BuildAngularBasePathOptions {
  projectOptions?: Partial<ProjectOptions>;
}

export function TsMorphAngularProjectTransform(
  options: Readonly<TsMorphAngularProjectTransformOptions>,
  cb: (project: Project, sourceFile: SourceFile[]) => void,
  filePath: string[],
): Rule
export function TsMorphAngularProjectTransform(
  options: Readonly<TsMorphAngularProjectTransformOptions>,
  cb: (project: Project, sourceFile: SourceFile) => void,
  filePath: string,
): Rule
export function TsMorphAngularProjectTransform(
  options: Readonly<TsMorphAngularProjectTransformOptions>,
  cb: (project: Project, sourceFile: undefined) => void,
  filePath?: undefined,
): Rule
export function TsMorphAngularProjectTransform(
  options: Readonly<TsMorphAngularProjectTransformOptions>,
  cb: TsMorphTransformCallback,
  filePath?: undefined | string | string[],
): Rule {
  return chain([
    tree => {
      const basePath = BuildAngularBasePath(tree, options);
      return TsMorphTransform(
        basePath,
        cb,
        options.projectOptions,
        filePath as any,
      );
    },
  ]);
}
