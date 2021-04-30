import { Tree } from '@angular-devkit/schematics';
import { AngularJson } from './angular-json';
import {
  GetJsonFile,
  UpdateJsonFile
} from './json-file';
import { PackageJson } from './package-json';
import { Project } from './angular-json/project';

export function GetAngularJson(host: Tree): AngularJson {
  return GetJsonFile(host, 'angular.json');
}

export class AngularProject {

  public get prefix(): string | undefined {
    return this._project.prefix;
  }

  constructor(private readonly _project: Project) {}

}

export class AngularProjectMap {

  private readonly _map = new Map<string, AngularProject>();

  constructor(private readonly _projectMap: Record<string, Project>) {
    for (const [name, project] of Object.entries(_projectMap)) {
      const angularProject = new AngularProject(project);
      this._map.set(name, angularProject);
    }
  }

  public add(name: string, project: Project) {
    if (this._map.has(name)) {
      throw new Error(`A project with the name '${name}' already exists`);
    }
    this._map.set(name, new AngularProject(project));
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

}

export class Angular {

  public get defaultProject(): AngularProject | undefined {
    return this._angular.defaultProject ? this.projects.get(this._angular.defaultProject) : undefined;
  }

  public readonly projects: AngularProjectMap;

  constructor(private readonly _angular: AngularJson) {
    if (!this._angular.projects) {
      this._angular.projects = {} as any;
    }
    this.projects = new AngularProjectMap(this._angular.projects!);
  }

}

export function UpdateAngularJson(
  updaterOrJsonFile: PackageJson | ((angularJson: PackageJson) => void | PromiseLike<void>),
  space: string | number = 2,
) {
  return UpdateJsonFile(updaterOrJsonFile, 'angular.json', space);
}
