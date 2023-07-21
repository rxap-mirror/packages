import {
  Rule,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import { AngularJson } from './angular-json';
import { CliOptions } from './angular-json/cli-options';
import { I18n } from './angular-json/i18n';
import { Project } from './angular-json/project';
import { SchematicOptions } from './angular-json/schematic-options';
import { Target } from './angular-json/target';
import { clone } from './clone';
import {
  GetJsonFile,
  HasJsonFile,
  UpdateJsonFileOptions,
  UpdateJsonFileRule,
} from './json-file';

export function IsAngularJson(angularJson: AngularJson | FragmentedAngularJson): angularJson is AngularJson {
  return !!angularJson.projects && Object.values(angularJson.projects).every(project => typeof project === 'object');
}

export function GetAngularJsonFragments(host: Tree, angularJson: FragmentedAngularJson): AngularJson {
  const copy = clone(angularJson);

  if (!copy.projects) {
    copy.projects = {};
  }

  for (const [ project, path ] of Object.entries(copy.projects)) {
    copy.projects[project] = GetJsonFile(host, path + '/project.json');
  }

  if (!IsAngularJson(copy)) {
    throw new Error('Failed to create full angular json from fragments');
  }

  return copy;
}

export interface FragmentedAngularJson {
  version: number,
  projects?: Record<string, string>
}

export function IsFragmentedAngularJson(angularJson: AngularJson | FragmentedAngularJson): angularJson is FragmentedAngularJson {
  return angularJson.version === 2;
}

export function GetAngularJson(host: Tree): AngularJson {

  let filePath = 'angular.json';

  if (HasJsonFile(host, filePath)) {
    console.warn('use workspace.json instead of angular.json');
    filePath = 'workspace.json';
  } else if (!HasJsonFile(host, filePath)) {
    throw new SchematicsException('Could not find angular.json or workspace.json');
  }

  let content = GetJsonFile<AngularJson | FragmentedAngularJson>(host, filePath);

  if (IsFragmentedAngularJson(content)) {
    content = GetAngularJsonFragments(host, content);
  }

  return content;
}

export class AngularProjectTargetConfigurationsMap {

  private readonly _map = new Map<string, Record<string, any>>();

  constructor(private readonly _configurationsMap: Record<string, Record<string, any>>) {
    for (const [ name, configuration ] of Object.entries(_configurationsMap)) {
      this._map.set(name, configuration);
    }
  }

  public add(name: string, configuration: Record<string, any>) {
    if (this._map.has(name)) {
      throw new Error(`A configuration with the name '${ name }' already exists`);
    }
    this._map.set(name, configuration);
    this._configurationsMap[name] = configuration;
  }

  public get(name: string): Record<string, any> | undefined {
    return this._map.get(name);
  }

  public has(name: string): boolean {
    return this._map.has(name);
  }

  public delete(name: string): boolean {
    const success = this._map.delete(name);
    if (success) {
      delete this._configurationsMap[name];
    }
    return success;
  }

}

export class AngularProjectTarget<Options extends Record<string, any> = Record<string, any>> {

  public get builder(): string | undefined {
    return this._target.builder;
  }

  public set builder(builder: string | undefined) {
    this._target.builder = builder;
  }

  public get options(): Options {
    return this._target.options;
  }

  public set options(options: Options) {
    this._target.options = options;
  }

  public get configurations(): Record<string, Options> | undefined {
    return this._target.configurations as any;
  }

  public set configurations(configurations: Record<string, Options> | undefined) {
    this._target.configurations = configurations;
  }

  constructor(private _target: Target) {
  }

}

export class AngularProjectTargetMap {

  private readonly _map = new Map<string, AngularProjectTarget<any>>();

  constructor(private readonly _targetMap: Record<string, Target>) {
    for (const [ name, target ] of Object.entries(_targetMap)) {
      const angularProjectTarget = new AngularProjectTarget(target);
      this._map.set(name, angularProjectTarget);
    }
  }

  public add(name: string, target: Target) {
    if (this._map.has(name)) {
      throw new Error(`A target with the name '${ name }' already exists`);
    }
    this._map.set(name, new AngularProjectTarget(target));
    this._targetMap[name] = target;
  }

  public get<Options extends Record<string, any> = Record<string, any>>(name: string): AngularProjectTarget<Options> | undefined {
    return this._map.get(name);
  }

  public has(name: string): boolean {
    return this._map.has(name);
  }

  public delete(name: string): boolean {
    const success = this._map.delete(name);
    if (success) {
      delete this._targetMap[name];
    }
    return success;
  }

  public keys(): IterableIterator<string> {
    return this._map.keys();
  }

  public values(): IterableIterator<AngularProjectTarget> {
    return this._map.values();
  }

  public entries(): IterableIterator<[ string, AngularProjectTarget ]> {
    return this._map.entries();
  }

}

export class AngularProject {

  public get prefix(): string | undefined {
    return this._project.prefix;
  }

  public get cli(): CliOptions {
    if (!this._project.cli) {
      this._project.cli = {};
    }
    return this._project.cli;
  }

  public get schematics(): SchematicOptions {
    if (!this._project.schematics) {
      this._project.schematics = {};
    }
    return this._project.schematics;
  }

  public get root(): string | undefined {
    return this._project.root;
  }

  public get i18n(): I18n {
    if (!this._project.i18n) {
      this._project.i18n = {};
    }
    return this._project.i18n;
  }

  public get sourceRoot(): string | undefined {
    return this._project.sourceRoot;
  }

  public get projectType(): string | undefined {
    return this._project.projectType;
  }

  public readonly targets: AngularProjectTargetMap;

  constructor(public readonly _project: Project, public readonly name: string) {
    if (!this._project.targets && !this._project.architect) {
      this._project.targets = {} as any;
    }
    this.targets = new AngularProjectTargetMap(this._project.architect ?? this._project.targets ?? {});
  }
}

export class AngularProjectMap {
  private readonly _map = new Map<string, AngularProject>();

  constructor(public readonly _projectMap: Record<string, Project>) {
    for (const [ name, project ] of Object.entries(_projectMap)) {
      const angularProject = new AngularProject(project, name);
      this._map.set(name, angularProject);
    }
  }

  public add(name: string, project: Project) {
    if (this._map.has(name)) {
      throw new Error(`A project with the name '${ name }' already exists`);
    }
    this._map.set(name, new AngularProject(project, name));
    this._projectMap[name] = project;
  }

  public get(name: string): AngularProject | undefined {
    return this._map.get(name);
  }

  public has(name: string): boolean {
    return this._map.has(name);
  }

  public delete(name: string): boolean {
    const success = this._map.delete(name);
    if (success) {
      delete this._projectMap[name];
    }
    return success;
  }

  public keys(): IterableIterator<string> {
    return this._map.keys();
  }

  public values(): IterableIterator<AngularProject> {
    return this._map.values();
  }

  public entries(): IterableIterator<[ string, AngularProject ]> {
    return this._map.entries();
  }

}

export class Angular {

  public get cli(): CliOptions {
    if (!this._angular.cli) {
      this._angular.cli = {};
    }
    return this._angular.cli;
  }

  public get schematics(): Record<string, Record<string, any>> {
    if (!this._angular.schematics) {
      this._angular.schematics = {};
    }
    return this._angular.schematics;
  }

  public get defaultProject(): AngularProject | undefined {
    return this._angular.defaultProject
      ? this.projects.get(this._angular.defaultProject)
      : undefined;
  }

  public readonly projects: AngularProjectMap;

  constructor(private readonly _angular: AngularJson) {
    if (!this._angular.projects) {
      this._angular.projects = {} as any;
    }
    this.projects = new AngularProjectMap(this._angular.projects!);
  }
}

export type UpdateAngularJsonFileOptions = UpdateJsonFileOptions

/**
 * @deprecated removed
 */
export function UpdateAngularJson(
  updater: (angular: Angular) => void | PromiseLike<void>,
  options?: UpdateAngularJsonFileOptions,
): Rule {
  return UpdateJsonFileRule(
    async (angularJson: AngularJson) => {
      try {
        await updater(new Angular(angularJson));
      } catch (e: any) {
        throw new SchematicsException(
          `Could not update the angular.json: ${ e.message }`,
        );
      }
    },
    'angular.json',
    options,
  );
}

export interface UpdateAngularProjectOptions extends UpdateAngularJsonFileOptions {
  projectName: string;
}

/**
 * @deprecated removed
 */
export function UpdateAngularProject(
  updater: (project: AngularProject) => void | PromiseLike<void>,
  options: UpdateAngularProjectOptions,
): Rule {
  return UpdateAngularJson(
    async (angular: Angular) => {
      if (!angular.projects.has(options.projectName)) {
        throw new SchematicsException(`The project '${ options.projectName }' does not exists.`);
      }
      const project = angular.projects.get(options.projectName)!;
      try {
        await updater(project);
      } catch (e: any) {
        throw new SchematicsException(`Could not update the project '${ options.projectName }'`);
      }
    },
    options,
  );
}
