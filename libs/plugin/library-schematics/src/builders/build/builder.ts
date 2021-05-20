import {
  BuilderContext,
  BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import { LibrarySchematicsBuilderSchema } from './schema';
import { CopyFiles } from './copy-files';
import { join } from 'path';
import { Glob } from './glob';
import { json } from '@angular-devkit/core';
import { ReadFile } from './read-file';
import { Tsc } from './tsc';

export interface Target extends json.JsonObject {
  project: string;
  target: string;
  configuration: string;
}

export class Builder {

  public static Run(
    options: LibrarySchematicsBuilderSchema,
    context: BuilderContext
  ) {
    return new Builder(options, context).run();
  }

  public static Create(): any {
    return createBuilder(Builder.Run);
  }

  public readonly glob     = new Glob();
  public readonly copyFile = new CopyFiles();

  constructor(
    public readonly options: LibrarySchematicsBuilderSchema,
    public readonly context: BuilderContext
  ) {}

  private stringToTarget(str: string): Target {
    const split = str.split(':');
    if (split.length < 2) {
      throw new Error(`Can not convert string '${str}' into target`);
    }
    return {
      project:       split[ 0 ],
      target:        split[ 1 ],
      configuration: split[ 2 ]
    };
  }

  public async extractOutputPath(buildTarget: Target, root: string): Promise<string> {
    const buildTargetOptions = await this.context.getTargetOptions(buildTarget);

    const ngPackageFile = buildTargetOptions.project;

    if (!ngPackageFile || typeof ngPackageFile !== 'string') {
      throw new Error(`Could not extract ng-package.json for build target '${this.options.buildTarget}'`);
    }

    const readFile = new ReadFile();

    const ngPackage = JSON.parse(readFile.sync(join(process.cwd(), ngPackageFile)));

    const outputPath = join(root, ngPackage.dest);

    if (!outputPath || typeof outputPath !== 'string') {
      throw new Error(`Could not extract output path for build target '${this.options.buildTarget}'`);
    }

    return outputPath;
  }

  public async compileSchematics(): Promise<any> {

    const tsc = new Tsc(this.context.logger as any);

    return tsc.compile({ tsConfig: join(process.cwd(), this.options.tsConfig) });

  }

  public async extractRootPath(project: string): Promise<string> {

    const projectMetadata = await this.context.getProjectMetadata(project);
    const root            = projectMetadata.root;

    if (!root || typeof root !== 'string') {
      throw new Error(`Could not extract root path for project '${project}'`);
    }

    return root;
  }

  public async run(): Promise<BuilderOutput> {

    if (!this.context.target?.project) {
      throw new Error('The target project is not defined!');
    }

    const buildTarget = this.stringToTarget(this.options.buildTarget);

    const root       = await this.extractRootPath(this.context.target?.project);
    const outputPath = await this.extractOutputPath(buildTarget, root);

    console.log('Building schematics');

    try {
      const result = await this.compileSchematics();

      if (result) {
        return { success: false };
      }

    } catch (e) {
      return { success: false };
    }

    console.log('Copy schema.json files');

    this.copySchemaJson(root, outputPath);

    console.log('Copy schematics template files');

    this.copySchematicsFiles(root, outputPath);

    console.log('Copy collection.json');

    this.copyCollectionJson(root, outputPath);

    console.log('Copy migration.json');

    this.copyMigrationJson(root, outputPath);

    return { success: true };

  }

  public copySchemaJson(root: string, outputPath: string) {
    const schemas = this.glob.sync(join(process.cwd(), root, 'schematics', '*', 'schema.json'));

    for (const schema of schemas) {
      this.copyFile.sync(schema, schema.replace(root, outputPath));
    }
  }

  public copySchematicsFiles(root: string, outputPath: string) {
    const files = this.glob.sync(join(root, 'schematics', '*', 'files', '**'));

    for (const file of files) {
      this.copyFile.sync(file, file.replace(root, outputPath));
    }
  }

  public copyCollectionJson(root: string, outputPath: string) {
    this.copyFile.sync(join(process.cwd(), root, 'schematics', 'collection.json'), join(process.cwd(), outputPath, 'schematics', 'collection.json'));
  }

  public copyMigrationJson(root: string, outputPath: string) {
    this.copyFile.sync(join(process.cwd(), root, 'schematics', 'migration.json'), join(process.cwd(), outputPath, 'schematics', 'migration.json'));
  }

}

export default Builder.Create();
