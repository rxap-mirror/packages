import {
  BuilderContext,
  BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import { BuildBuilderSchema } from './schema';
import { json } from '@angular-devkit/core';
import { Yarn } from './yarn';
import { join } from 'path';
import { ReadFile } from './read-file';

export interface Target extends json.JsonObject {
  project: string;
  target: string;
  configuration: string;
}


export class Builder {

  public static Run(
    options: BuildBuilderSchema,
    context: BuilderContext
  ) {
    return new Builder(options, context).run();
  }

  public static Create() {
    return createBuilder(Builder.Run);
  }

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

  constructor(
    public readonly options: BuildBuilderSchema,
    public readonly context: BuilderContext
  ) {}

  public async extractRootPath(project: string): Promise<string> {

    const projectMetadata = await this.context.getProjectMetadata(project);
    const root            = projectMetadata.root;

    if (!root || typeof root !== 'string') {
      throw new Error(`Could not extract root path for project '${project}'`);
    }

    return root;
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

  public async run(): Promise<BuilderOutput> {

    if (!this.context.target?.project) {
      throw new Error('The target project is not defined!');
    }

    const yarn = new Yarn(this.context.logger);

    const buildTarget = this.stringToTarget(this.options.buildTarget);

    const root       = await this.extractRootPath(this.context.target?.project);
    const outputPath = await this.extractOutputPath(buildTarget, root);

    const args = [
      'scss-bundle',
      `--outFile="${outputPath}/${this.options.outFile ?? '_theming.scss'}"`,
      `--rootDir="${root}/src"`,
      `--entryFile="${root}/src/_index.scss"`,
      '--project="./"'
    ];

    for (const ignoreImport of this.options.ignoreImports) {
      args.push(`--ignoreImports="${ignoreImport}"`);
    }

    const result = await yarn.spawn(args);

    return { success: !Number(result) };

  }

}

export default Builder.Create();
