import { Rule } from '@angular-devkit/schematics';
import {
  TsMorphAngularProjectTransform,
  TsMorphAngularProjectTransformOptions as _TsMorphAngularProjectTransformOptions,
  TsMorphNestProjectTransform,
  TsMorphNestProjectTransformOptions as _TsMorphNestProjectTransformOptions,
  TsMorphTransform,
  TsMorphTransformCallback as _TsMorphTransformCallback,
  TsMorphTransformOptions,
} from '@rxap/workspace-ts-morph';
import {
  Project,
  ProjectOptions,
  SourceFile,
} from 'ts-morph';

/**
 * @deprecated import from the package @rxap/workspace-ts-morph
 */
export type TsMorphTransformCallback = _TsMorphTransformCallback;

export function TsMorphTransformRule(
  sourceRoot: string,
  cb: (project: Project, sourceFile: SourceFile[]) => void,
  options?: TsMorphTransformOptions,
  projectOptions?: Partial<ProjectOptions>,
  filePath?: string[],
): Rule
export function TsMorphTransformRule(
  sourceRoot: string,
  cb: (project: Project, sourceFile: SourceFile) => void,
  options?: TsMorphTransformOptions,
  projectOptions?: Partial<ProjectOptions>,
  filePath?: string,
): Rule
export function TsMorphTransformRule(
  sourceRoot: string,
  cb: (project: Project, sourceFile: undefined) => void,
  options?: TsMorphTransformOptions,
  projectOptions?: Partial<ProjectOptions>,
  filePath?: undefined,
): Rule
export function TsMorphTransformRule(
  sourceRoot: string,
  cb: TsMorphTransformCallback,
  options: TsMorphTransformOptions = {},
  projectOptions: Partial<ProjectOptions> = {},
  filePathFilter?: undefined | string | string[],
): Rule {
  return tree => TsMorphTransform(tree, sourceRoot, cb as any, options, projectOptions, filePathFilter as any);
}

/**
 * @deprecated import from the package @rxap/workspace-ts-morph
 */
export type TsMorphNestProjectTransformOptions = _TsMorphNestProjectTransformOptions;

export function TsMorphNestProjectTransformRule(
  options: Readonly<TsMorphNestProjectTransformOptions>,
  cb: (project: Project, sourceFile: SourceFile[]) => void,
  filePath: string[],
): Rule
/**
 * @deprecated pass the filePath as array
 */
export function TsMorphNestProjectTransformRule(
  options: Readonly<TsMorphNestProjectTransformOptions>,
  cb: (project: Project, sourceFile: SourceFile) => void,
  filePath: string,
): Rule
export function TsMorphNestProjectTransformRule(
  options: Readonly<TsMorphNestProjectTransformOptions>,
  cb: (project: Project, sourceFile: undefined) => void,
  filePath?: undefined,
): Rule
export function TsMorphNestProjectTransformRule(
  options: Readonly<TsMorphNestProjectTransformOptions>,
  cb: TsMorphTransformCallback,
  filePath?: undefined | string | string[],
): Rule {
  return tree => TsMorphNestProjectTransform(tree, options, cb as any, filePath as any);
}

/**
 * @deprecated import from the package @rxap/workspace-ts-morph
 */
export type TsMorphAngularProjectTransformOptions = _TsMorphAngularProjectTransformOptions;

export function TsMorphAngularProjectTransformRule(
  options: Readonly<TsMorphAngularProjectTransformOptions>,
  cb: (project: Project, sourceFile: SourceFile[]) => void,
  filePath: string[],
): Rule
export function TsMorphAngularProjectTransformRule(
  options: Readonly<TsMorphAngularProjectTransformOptions>,
  cb: (project: Project, sourceFile: SourceFile) => void,
  filePath: string,
): Rule
export function TsMorphAngularProjectTransformRule(
  options: Readonly<TsMorphAngularProjectTransformOptions>,
  cb: (project: Project, sourceFile: undefined) => void,
  filePath?: undefined,
): Rule
export function TsMorphAngularProjectTransformRule(
  options: Readonly<TsMorphAngularProjectTransformOptions>,
  cb: TsMorphTransformCallback,
  filePath?: undefined | string | string[],
): Rule {
  return tree => TsMorphAngularProjectTransform(tree, options, cb as any, filePath as any);
}

export type TsMorphTransformFunctionRule<Options extends TsMorphNestProjectTransformOptions | TsMorphAngularProjectTransformOptions> = ((
  options: Readonly<Options>,
  cb: (project: Project, sourceFile: SourceFile[]) => void,
  filePath: string[],
) => Rule);
