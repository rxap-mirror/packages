import { deepMerge } from '@rxap/utilities';
import {
  BuildAngularBasePath,
  BuildAngularBasePathOptions,
  BuildNestBasePath,
  TreeLike,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import {
  IndentationText,
  Project,
  ProjectOptions,
  QuoteKind,
  SourceFile,
} from 'ts-morph';
import { AddDir } from './add-dir';
import { ApplyTsMorphProject } from './apply-ts-morph-project';

export type TsMorphTransformCallback = ((project: Project, sourceFile: undefined) => void) |
  ((project: Project, sourceFile: SourceFile) => void) |
  ((project: Project, sourceFile: SourceFile[]) => void);

export function TsMorphTransform(
  tree: TreeLike,
  sourceRoot: string,
  cb: (project: Project, sourceFile: SourceFile[]) => void,
  options?: Partial<ProjectOptions>,
  filePath?: string[],
): void
export function TsMorphTransform(
  tree: TreeLike,
  sourceRoot: string,
  cb: (project: Project, sourceFile: SourceFile) => void,
  options?: Partial<ProjectOptions>,
  filePath?: string,
): void
export function TsMorphTransform(
  tree: TreeLike,
  sourceRoot: string,
  cb: (project: Project, sourceFile: undefined) => void,
  options?: Partial<ProjectOptions>,
  filePath?: undefined,
): void
export function TsMorphTransform(
  tree: TreeLike,
  sourceRoot: string,
  cb: TsMorphTransformCallback,
  options: Partial<ProjectOptions> = {},
  filePathFilter?: undefined | string | string[],
): void {
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

  AddDir(tree, sourceRoot, project, filePath ?
    (fileName: string, dirPath: string) => {
      const fullPath = join(dirPath, fileName);
      if (dirPath.endsWith(fileName)) {
        throw new Error(`The dirPath '${ dirPath }' ends with the fileName '${ fileName }'`);
      }
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

  (cb as any)(project, sourceFile);

  ApplyTsMorphProject(tree, project, sourceRoot, false);
}

export interface TsMorphNestProjectTransformOptions {
  project: string;
  feature?: string | null;
  shared?: boolean;
  directory?: string | null;
  projectOptions?: Partial<ProjectOptions>;
}

export function TsMorphNestProjectTransform(
  tree: TreeLike,
  options: Readonly<TsMorphNestProjectTransformOptions>,
  cb: (project: Project, sourceFile: SourceFile[]) => void,
  filePath: string[],
): void
/**
 * @deprecated pass the filePath as array
 */
export function TsMorphNestProjectTransform(
  tree: TreeLike,
  options: Readonly<TsMorphNestProjectTransformOptions>,
  cb: (project: Project, sourceFile: SourceFile) => void,
  filePath: string,
): void
export function TsMorphNestProjectTransform(
  tree: TreeLike,
  options: Readonly<TsMorphNestProjectTransformOptions>,
  cb: (project: Project, sourceFile: undefined) => void,
  filePath?: undefined,
): void
export function TsMorphNestProjectTransform(
  tree: TreeLike,
  options: Readonly<TsMorphNestProjectTransformOptions>,
  cb: TsMorphTransformCallback,
  filePath?: undefined | string | string[],
): void {
  const basePath = BuildNestBasePath(tree, options);
  return TsMorphTransform(
    tree,
    basePath,
    cb as any,
    options.projectOptions,
    filePath as any,
  );
}

export interface TsMorphAngularProjectTransformOptions extends BuildAngularBasePathOptions {
  projectOptions?: Partial<ProjectOptions>;
}

export function TsMorphAngularProjectTransform(
  tree: TreeLike,
  options: Readonly<TsMorphAngularProjectTransformOptions>,
  cb: (project: Project, sourceFile: SourceFile[]) => void,
  filePath: string[],
): void
export function TsMorphAngularProjectTransform(
  tree: TreeLike,
  options: Readonly<TsMorphAngularProjectTransformOptions>,
  cb: (project: Project, sourceFile: SourceFile) => void,
  filePath: string,
): void
export function TsMorphAngularProjectTransform(
  tree: TreeLike,
  options: Readonly<TsMorphAngularProjectTransformOptions>,
  cb: (project: Project, sourceFile: undefined) => void,
  filePath?: undefined,
): void
export function TsMorphAngularProjectTransform(
  tree: TreeLike,
  options: Readonly<TsMorphAngularProjectTransformOptions>,
  cb: TsMorphTransformCallback,
  filePath?: undefined | string | string[],
): void {
  const basePath = BuildAngularBasePath(tree, options);
  return TsMorphTransform(
    tree,
    basePath,
    cb as any,
    options.projectOptions,
    filePath as any,
  );
}

export type TsMorphTransformFunction<Options extends TsMorphNestProjectTransformOptions | TsMorphAngularProjectTransformOptions> = ((
  tree: TreeLike,
  options: Readonly<Options>,
  cb: (project: Project, sourceFile: SourceFile[]) => void,
  filePath: string[],
) => void);
