import { CreateProject } from '@rxap/ts-morph';
import {
  coerceArray,
  isPromise,
} from '@rxap/utilities';
import {
  BuildAngularBasePath,
  BuildAngularBasePathOptions,
  BuildNestBasePath,
  GetProjectRoot,
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

export type AsyncTsMorphTransformCallback = ((project: Project, sourceFile: undefined) => Promise<void>) |
  ((project: Project, sourceFile: SourceFile) => Promise<void>) |
  ((project: Project, sourceFile: SourceFile[]) => Promise<void>);

export interface TsMorphTransformOptions {
  replace?: boolean;
  /**
   * true - if the filePath is set only this files will be included in the ts-morph project
   * false - all files that are accessible from the sourceRoot will be included in the ts-morph project
   * default: true
   */
  filter?: boolean;
  /**
   * false - files that are not typescript files will be excluded
   */
  includeNonTsFiles?: boolean;
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
  cb: (project: Project, sourceFile: SourceFile[]) => Promise<void>,
  options?: TsMorphTransformOptions,
  projectOptions?: Partial<ProjectOptions>,
  filePath?: string[],
): Promise<void>
export function TsMorphTransform(
  tree: TreeLike,
  sourceRoot: string,
  cb: (project: Project, sourceFile: SourceFile) => Promise<void>,
  options?: TsMorphTransformOptions,
  projectOptions?: Partial<ProjectOptions>,
  filePath?: string,
): Promise<void>
export function TsMorphTransform(
  tree: TreeLike,
  sourceRoot: string,
  cb: (project: Project, sourceFile: undefined) => Promise<void>,
  options?: TsMorphTransformOptions,
  projectOptions?: Partial<ProjectOptions>,
  filePath?: undefined,
): Promise<void>
/**
 * Transforms TypeScript source files using the TsMorph library based on specified options and filters.
 *
 * @param tree - An abstract representation of the file system hierarchy.
 * @param sourceRoot - The root directory where the source files are located.
 * @param cb - A callback function that performs operations on the TsMorph project and its source files.
 * @param options - Configuration options for the transformation process. Defaults to an empty object.
 * @param projectOptions - Additional options to configure the TsMorph project. Defaults to an empty object.
 * @param filePathFilter - Optional filter to specify which files should be included in the transformation. Can be a single string, an array of strings, or undefined.
 *
 * The function initializes a TsMorph project with the given `projectOptions`, and logs the transformation process.
 * It handles file path filtering, ensuring only specified files are included based on `filePathFilter`.
 * If `options.replace` is false, it adds directories and files to the project without replacing existing ones.
 * The function throws errors for invalid configurations or when specified files do not exist and are required.
 * Finally, it applies the transformations to the project and updates the file system tree.
 *
 * Errors:
 * - Throws an error if `dirPath` ends with `fileName`.
 * - Throws an error if a specified file does not exist and is not marked as optional when `replace` is false.
 * - Throws an error if `filePathFilter` is not an array but multiple files are attempted to be processed.
 */
export function TsMorphTransform(
  tree: TreeLike,
  sourceRoot: string,
  cb: TsMorphTransformCallback | AsyncTsMorphTransformCallback,
  options: TsMorphTransformOptions = {},
  projectOptions: Partial<ProjectOptions> = {},
  filePathFilter?: undefined | string | string[],
): void | Promise<void> {
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

  console.log(`TsMorphTransform for sourceRoot '${sourceRoot}' with fileList: [ ${coerceArray(filePathFilter).join(', ')} ]`.grey);

  if (!replace) {
    AddDir(
      tree,
      sourceRoot,
      project,
      (fileName: string, dirPath: string) => {
        let include = false;
        if (!filePath || !filter) {
          include = true;
        } else {
          const fullPath = join(dirPath, fileName);
          if (dirPath.endsWith(fileName)) {
            throw new Error(`The dirPath '${ dirPath }' ends with the fileName '${ fileName }'`);
          }
          include = filePath.map(f => f.replace(/\?$/, '')).some(f => fullPath.endsWith(f));
        }
        if (include && !options.includeNonTsFiles && !fileName.endsWith('.ts')) {
          include = false;
        }
        return include;
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

  const result = (cb as any)(project, sourceFile);

  if (isPromise(result)) {
    return result.then(() => {
      ApplyTsMorphProject(tree, project, sourceRoot, false);
    });
  } else {
    ApplyTsMorphProject(tree, project, sourceRoot, false);
  }
}

export interface TsMorphNestProjectTransformOptions extends TsMorphTransformOptions {
  project: string;
  feature?: string | null;
  shared?: boolean;
  directory?: string | null;
  projectOptions?: Partial<ProjectOptions>;
  backend: { project?: string | null, kind?: any } | undefined;
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
/**
 * Transforms a NestJS project using TypeScript morph transformations.
 *
 * This function applies a transformation to a NestJS project by utilizing the TsMorph library. It first constructs a base path for the project using the provided `tree` and `options`, then delegates the transformation process to the `TsMorphTransform` function.
 *
 * @param tree - The project's file structure represented as a `TreeLike` object, which abstracts the file system operations.
 * @param options - An object of type `TsMorphNestProjectTransformOptions`, which includes settings and configurations for the transformation process.
 * @param cb - A callback function of type `TsMorphTransformCallback` that defines how each file should be transformed using the TsMorph library.
 * @param filePath - Optional. A specific file path or an array of file paths within the project to apply the transformation. If undefined, the transformation is applied to all applicable files within the project.
 */
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
  basePath?: string;
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
/**
 * Transforms an Angular project using TypeScript morph transformations.
 *
 * This function applies a transformation callback to an Angular project's TypeScript files,
 * potentially modifying their structure or contents based on the provided options. It leverages
 * the TsMorph library to manipulate the project's source code files.
 *
 * @param tree - An abstraction representing the file structure of the project.
 * @param options - Configuration options that are immutable, guiding the transformation process.
 * @param cb - A callback function that defines how individual files or sets of files should be transformed.
 * @param filePath - Optional. A specific file or array of files to target for transformation. If undefined,
 * the transformation is applied to all relevant files in the project.
 *
 * @remarks
 * The `filePath` parameter allows for selective transformation, enabling focused modifications rather than
 * a full-project sweep. This can be useful for large projects or when only certain files need to be updated.
 *
 * The transformation process is initialized by determining the base path of the Angular project using the
 * `BuildAngularBasePath` function, which constructs the path based on the provided `tree` and `options`.
 * This base path is then used to guide the TsMorph transformation process.
 */
export function TsMorphAngularProjectTransform(
  tree: TreeLike,
  options: Readonly<TsMorphAngularProjectTransformOptions>,
  cb: TsMorphTransformCallback,
  filePath?: undefined | string | string[],
): void {
  const basePath = options.basePath ?? BuildAngularBasePath(tree, options);
  return TsMorphTransform(
    tree,
    basePath,
    cb as any,
    options,
    options.projectOptions,
    filePath as any,
  );
}

export interface TsMorphProjectTransformOptions extends TsMorphTransformOptions {
  projectOptions?: Partial<ProjectOptions>;
  project: string;
}

export function TsMorphProjectTransform(
  tree: TreeLike,
  options: Readonly<TsMorphProjectTransformOptions>,
  cb: (project: Project, sourceFile: SourceFile[]) => void,
  filePath: string[],
): void
export function TsMorphProjectTransform(
  tree: TreeLike,
  options: Readonly<TsMorphProjectTransformOptions>,
  cb: (project: Project, sourceFile: SourceFile) => void,
  filePath: string,
): void
export function TsMorphProjectTransform(
  tree: TreeLike,
  options: Readonly<TsMorphProjectTransformOptions>,
  cb: (project: Project, sourceFile: undefined) => void,
  filePath?: undefined,
): void
/**
 * Transforms a project using the TsMorph library based on specified options and a callback function.
 *
 * This function serves as a wrapper around the `TsMorphTransform` function, specifically tailored to handle
 * TypeScript project transformations. It utilizes the TsMorph library to apply transformations to files within
 * a project structure.
 *
 * @param tree - The abstract representation of the file tree to which the transformation will be applied.
 * @param options - An object containing options for the transformation, including project-specific settings.
 * @param cb - A callback function that defines how individual files or sets of files should be transformed.
 * This function is called for each file in the project that matches the criteria specified in `filePath`.
 * @param filePath - Optional. A path or an array of paths specifying particular files or directories to transform.
 * If undefined, the transformation is applied to all files in the project.
 *
 * @remarks
 * The `options` object must include a `project` property that specifies the name of the project within the workspace.
 * Additional project-specific options can be provided through `options.projectOptions`.
 *
 * The function first determines the root directory of the project by calling `GetProjectRoot` with the provided `tree`
 * and `project` name from `options`. It then delegates the actual transformation process to `TsMorphTransform`,
 * passing along the necessary parameters.
 *
 * @example
 * TsMorphProjectTransform(tree, {
 * project: 'my-app',
 * projectOptions: { compilerOptions: { target: ts.ScriptTarget.ES5 } }
 * }, (sourceFile) => {
 * sourceFile.addImportDeclaration({
 * moduleSpecifier: "lodash",
 * namedImports: ["flatten"]
 * });
 * });
 *
 */
export function TsMorphProjectTransform(
  tree: TreeLike,
  options: Readonly<TsMorphProjectTransformOptions>,
  cb: TsMorphTransformCallback,
  filePath?: undefined | string | string[],
): void {
  return TsMorphTransform(
    tree,
    GetProjectRoot(tree, options.project),
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
