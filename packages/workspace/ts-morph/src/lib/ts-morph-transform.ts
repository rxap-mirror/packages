import { CreateProject } from '@rxap/ts-morph';
import {
  BuildAngularBasePath,
  BuildAngularBasePathOptions,
  BuildNestBasePath,
  TreeLike,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import {
  Project,
  ProjectOptions,
  SourceFile,
} from 'ts-morph';
import { AddDir } from './add-dir';
import { ApplyTsMorphProject } from './apply-ts-morph-project';

export type TsMorphTransformCallback = ((project: Project, sourceFile: undefined) => void) |
  ((project: Project, sourceFile: SourceFile) => void) |
  ((project: Project, sourceFile: SourceFile[]) => void);

export interface TsMorphTransformOptions {
  replace?: boolean;
  /**
   * true - if the filePath is set only this files will be included in the ts-morph project
   * false - all files that are accessible from the sourceRoot will be included in the ts-morph project
   * default: true
   */
  filter?: boolean;
}

export function TsMorphTransform(
  tree: TreeLike,
  sourceRoot: string,
  cb: (project: Project, sourceFile: SourceFile[]) => void,
  options?: TsMorphTransformOptions,
  projectOptions?: Partial<ProjectOptions>,
  filePath?: string[],
): void
export function TsMorphTransform(
  tree: TreeLike,
  sourceRoot: string,
  cb: (project: Project, sourceFile: SourceFile) => void,
  options?: TsMorphTransformOptions,
  projectOptions?: Partial<ProjectOptions>,
  filePath?: string,
): void
export function TsMorphTransform(
  tree: TreeLike,
  sourceRoot: string,
  cb: (project: Project, sourceFile: undefined) => void,
  options?: TsMorphTransformOptions,
  projectOptions?: Partial<ProjectOptions>,
  filePath?: undefined,
): void
export function TsMorphTransform(
  tree: TreeLike,
  sourceRoot: string,
  cb: TsMorphTransformCallback,
  options: TsMorphTransformOptions = {},
  projectOptions: Partial<ProjectOptions> = {},
  filePathFilter?: undefined | string | string[],
): void {
  const {
    replace = false,
    filter = true,
  } = options;

  let filePath: string[] | undefined = undefined;

  if (filePathFilter) {
    if (Array.isArray(filePathFilter)) {
      filePath = filePathFilter;
    } else {
      filePath = [ filePathFilter ];
    }
  }

  const project = CreateProject(projectOptions);

  if (!replace) {
    AddDir(
      tree,
      sourceRoot,
      project,
      (fileName: string, dirPath: string) => {
        if (!filePath || !filter) {
          return true;
        }
        const fullPath = join(dirPath, fileName);
        if (dirPath.endsWith(fileName)) {
          throw new Error(`The dirPath '${ dirPath }' ends with the fileName '${ fileName }'`);
        }
        return filePath.map(f => f.replace(/\?$/, '')).some(f => fullPath.endsWith(f));
      }
    );
  }

  let sourceFile: SourceFile | SourceFile[] | undefined = undefined;

  if (filePath) {
    if (Array.isArray(filePath)) {
      sourceFile = filePath.map((f, index) => {
        const fileName = f.replace(/\?$/, '');
        const isOptional = f.endsWith('?');
        let sf = project.getSourceFile(fileName);
        if (!sf) {
          if (Array.isArray(filePathFilter)) {
            if (replace || isOptional) {
              sf = project.createSourceFile(fileName, '');
            } else {
              console.log(project.getSourceFiles().map(f => f.getFilePath()));
              throw new Error(`The file ${ fileName } does not exists with the source root ${ sourceRoot }`);
            }
          } else {
            if (index !== 0) {
              throw new Error('FATAL: The filePathFilter is not an array and the index is not 0');
            }
            if (replace || isOptional) {
              sf = project.createSourceFile(fileName, '');
            } else {
              throw new Error(`The file ${ fileName } does not exists with the source root ${ sourceRoot }`);
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

export interface TsMorphNestProjectTransformOptions extends TsMorphTransformOptions {
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
    options,
    options.projectOptions,
    filePath as any,
  );
}

export interface TsMorphAngularProjectTransformOptions extends BuildAngularBasePathOptions, TsMorphTransformOptions {
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
    options,
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
