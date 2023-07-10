import {chain, Rule} from '@angular-devkit/schematics';
import {IndentationText, Project, ProjectOptions, QuoteKind} from 'ts-morph';
import {deepMerge} from '@rxap/schematics-utilities';
import {CoerceNestServiceProject} from './nest/coerce-nest-service-project';
import {BuildAngularBasePath} from './angular/build-angular-base-path';
import {BuildNestBasePath} from './nest/build-nest-base-path';
import {ApplyTsMorphProject} from './ts-morph/apply-ts-morph-project';
import {AddDir} from './add-dir';

export function TsMorphTransform(
  sourceRoot: string,
  cb: (project: Project) => void,
  options: Partial<ProjectOptions> = {},
): Rule {
  return tree => {

    const project = new Project(deepMerge({
      manipulationSettings: {
        indentationText: IndentationText.TwoSpaces,
        quoteKind: QuoteKind.Single,
      },
      useInMemoryFileSystem: true,
    }, options));

    AddDir(tree.getDir(sourceRoot), project);

    cb(project);

    return ApplyTsMorphProject(project, sourceRoot, false);
  };
}

export function TsMorphNestProjectTransform(
  options: { project: string, feature?: string, shared?: boolean, directory?: string },
  cb: (project: Project) => void,
): Rule {
  return chain([
    CoerceNestServiceProject(options),
    tree => {
      const basePath = BuildNestBasePath(tree, options);
      return TsMorphTransform(
        basePath,
        cb,
      );
    },
  ]);
}

export interface TsMorphAngularProjectTransformOptions {
  project: string,
  feature: string,
  directory?: string
}

export function TsMorphAngularProjectTransform(
  options: Readonly<TsMorphAngularProjectTransformOptions>,
  cb: (project: Project) => void,
): Rule {
  return chain([
    tree => {
      const basePath = BuildAngularBasePath(tree, options);
      return TsMorphTransform(
        basePath,
        cb,
      );
    },
  ]);
}
