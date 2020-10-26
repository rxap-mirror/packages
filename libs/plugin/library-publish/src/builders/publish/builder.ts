import {
  BuilderContext,
  BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import { BuildBuilderSchema } from './schema';
import { join } from 'path';
import { json } from '@angular-devkit/core';
import { ReadFile } from './read-file';
import { Publish } from './publish';

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

  constructor(
    public readonly options: BuildBuilderSchema,
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

  private async extractOutputPath(buildTarget: Target, root: string): Promise<string> {
    const buildTargetOptions = await this.context.getTargetOptions(buildTarget);

    if (buildTargetOptions.hasOwnProperty('project')) {

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

    } else if (buildTargetOptions.hasOwnProperty('outputPath')) {
      return buildTargetOptions.outputPath as string;
    }

    throw new Error('Could not extract the output path');
  }

  private async extractRootPath(project: string): Promise<string> {

    const projectMetadata = await this.context.getProjectMetadata(project);
    const root            = projectMetadata.root;

    if (!root || typeof root !== 'string') {
      throw new Error(`Could not extract root path for project '${project}'`);
    }

    return root;
  }

  private async executeBuildTarget(buildTarget: Target): Promise<BuilderOutput> {
    const builderRun = await this.context.scheduleTarget(buildTarget);

    return builderRun.result;
  }

  public async run(): Promise<BuilderOutput> {

    if (!this.context.target?.project) {
      throw new Error('The target project is not defined!');
    }

    const buildTarget = this.stringToTarget(this.options.buildTarget);
    const preTarget = this.stringToTarget(this.options.preTarget);

    const root       = await this.extractRootPath(this.context.target?.project);
    const outputPath = await this.extractOutputPath(buildTarget, root);

    const builderOutput = await this.executeBuildTarget(preTarget);

    if (!builderOutput.success) {
      this.context.logger.error(`Could not execute build target '${this.options.preTarget}'`);
      return { success: false };
    }

    const publish = new Publish(this.context.logger);

    const result = publish.publish(outputPath, this.options.registry);

    return { success: !Number(result) };

  }

}

export default Builder.Create();
