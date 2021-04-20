import {
  BuilderContext,
  BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import { BuildBuilderSchema } from './schema';
import { json } from '@angular-devkit/core';

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

  public async executeBuildTarget(buildTarget: Target): Promise<BuilderOutput> {
    const builderRun = await this.context.scheduleTarget(buildTarget);

    return builderRun.result;
  }

  public async run(): Promise<BuilderOutput> {

    if (!this.context.target?.project) {
      throw new Error('The target project is not defined!');
    }

    for (const target of this.options.targets) {

      const buildTarget = this.stringToTarget(target);

      const builderOutput = await this.executeBuildTarget(buildTarget);

      if (!builderOutput.success) {
        this.context.logger.error(`Could not execute build target '${target}'`);
        return { success: false };
      }

    }

    return { success: true };

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
