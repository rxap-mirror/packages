import {
  BuilderContext,
  BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import { BuildBuilderSchema } from './schema';
import { json } from '@angular-devkit/core';
import {
  readFileSync,
  existsSync,
  writeFileSync
} from 'fs';
import { join } from 'path';
import { compile } from 'handlebars';

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

  public async run(): Promise<BuilderOutput> {

    if (!this.context.target?.project) {
      throw new Error('The target project is not defined!');
    }

    const indexHtmlTemplateFilePath = this.options.indexHtmlTemplate;

    if (!indexHtmlTemplateFilePath) {
      throw new Error('The i18n index html template path is not defined');
    }

    const indexHtmlTemplateAbsoluteFilePath = join(this.context.workspaceRoot, indexHtmlTemplateFilePath);

    if (!existsSync(indexHtmlTemplateAbsoluteFilePath)) {
      throw new Error(`Could not find the i18n index html template in '${indexHtmlTemplateAbsoluteFilePath}'`);
    }

    const indexHtmlTemplateFile = readFileSync(indexHtmlTemplateAbsoluteFilePath).toString('utf-8');

    const indexHtmlTemplate = compile(indexHtmlTemplateFile);

    const indexHtml = indexHtmlTemplate(this.options);

    const buildOptions = await this.context.getTargetOptions({
      target:        'build',
      project:       this.context.target?.project,
      configuration: this.context.target?.configuration!
    });

    const outputPath = buildOptions.outputPath;

    if (typeof outputPath !== 'string') {
      throw new Error(`Could not extract the output path from the build target with the configuration: '${this.context.target?.configuration}'`);
    }

    const indexHtmlFilePath = join(this.context.workspaceRoot, outputPath, 'index.html');

    if (existsSync(indexHtmlFilePath)) {
      throw new Error(`The index.html file already exists in the location: '${indexHtmlFilePath}'`);
    }

    writeFileSync(indexHtmlFilePath, indexHtml);

    return { success: true };

  }

}

export default Builder.Create();
