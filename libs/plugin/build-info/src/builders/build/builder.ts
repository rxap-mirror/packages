import {
  BuilderContext,
  BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import { BuildBuilderSchema } from './schema';
import { json } from '@angular-devkit/core';
import {
  existsSync,
  writeFileSync
} from 'fs';
import { join } from 'path';

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

  public async run(): Promise<BuilderOutput> {

    if (!this.context.target?.project) {
      throw new Error('The target project is not defined!');
    }

    const buildOptions = await this.context.getTargetOptions({
      target:        'build',
      project:       this.context.target?.project,
      configuration: this.context.target?.configuration!
    });

    const outputPath = buildOptions.outputPath;

    if (typeof outputPath !== 'string') {
      throw new Error(`Could not extract the output path from the build target with the configuration: '${this.context.target?.configuration}'`);
    }

    const buildInfo = this.options;

    if (!buildInfo.timestamp) {
      buildInfo.timestamp = new Date().toISOString();
    }

    const buildJsonFile = JSON.stringify(buildInfo, undefined, 2);

    const buildInfoFilePath = join(this.context.workspaceRoot, outputPath, 'build.json');

    if (existsSync(buildInfoFilePath)) {
      console.warn(`The build.json file already exists in the location: '${buildInfoFilePath}'`);
    }

    writeFileSync(buildInfoFilePath, buildJsonFile);

    return { success: true };

  }

}

export default Builder.Create();
