import {
  BuilderContext,
  BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import { BuildBuilderSchema } from './schema';
import { json } from '@angular-devkit/core';
import { Kaniko } from './kaniko';

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

  public static Create(): any {
    return createBuilder(Builder.Run);
  }

  constructor(
    public readonly options: BuildBuilderSchema,
    public readonly context: BuilderContext
  ) {}

  public async executeBuildTarget(buildTarget: Target): Promise<BuilderOutput> {
    const builderRun = await this.context.scheduleTarget(buildTarget);

    return builderRun.result;
  }

  public async run(): Promise<BuilderOutput> {

    if (!this.context.target?.project) {
      throw new Error('The target project is not defined!');
    }

    const preTarget = this.stringToTarget(this.options.preTarget);

    const builderOutput = await this.executeBuildTarget(preTarget);

    if (!builderOutput.success) {
      this.context.logger.error(`Could not execute build target '${this.options.preTarget}'`);
      return { success: false };
    }

    const kaniko = new Kaniko(this.context.logger as any);

    if (!this.options.context) {

      const buildTarget = this.stringToTarget(this.options.buildTarget);

      const buildTargetOptions = await this.context.getTargetOptions(buildTarget);

      this.options.context = buildTargetOptions.outputPath as string;

    }

    console.log('start kaniko...');

    const result = await kaniko.executor(
      this.options.command,
      this.options.context,
      this.options.dockerfile,
      this.options.destination
    );

    console.log('docker image build');

    return { success: !Number(result) };

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

}

export default Builder.Create();
