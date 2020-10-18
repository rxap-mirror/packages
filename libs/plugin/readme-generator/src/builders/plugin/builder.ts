import {
  BuilderContext,
  BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import { PluginBuilderSchema } from './schema';
import { json } from '@angular-devkit/core';
import {
  readFileSync,
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
    options: PluginBuilderSchema,
    context: BuilderContext
  ) {
    return new Builder(options, context).run();
  }

  public static Create() {
    return createBuilder(Builder.Run);
  }

  constructor(
    public readonly options: PluginBuilderSchema,
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

  public async run(): Promise<BuilderOutput> {

    if (!this.context.target?.project) {
      throw new Error('Could not extract target project');
    }

    const rootPath    = await this.extractRootPath(this.context.target?.project);
    const packageJson = JSON.parse(readFileSync(join(rootPath, 'package.json')).toString('utf-8'));

    const builders   = this.getBuildersJson(rootPath, packageJson);
    const collection = this.getCollectionJson(rootPath, packageJson);
    const template   = this.getTemplate(rootPath);

    const readme = template({ package: packageJson, builders, collection });

    console.log('README.md generated');

    writeFileSync(join(rootPath, 'README.md'), readme);

    return { success: true };

  }

  private getTemplate(basePath: string) {

    const readmeTemplateFile = readFileSync(join(basePath, 'README.md.handlebars')).toString('utf-8');

    return compile(readmeTemplateFile);

  }

  private getBuildersJson(basePath: string, packageJson: any) {

    const buildersJson: any = JSON.parse(readFileSync(join(basePath, 'builders.json')).toString('utf-8'));

    for (const builder of Object.values<any>(buildersJson.builders)) {

      builder.schema = JSON.parse(readFileSync(join(basePath, builder.schema)).toString('utf-8'));
      builder.name   = packageJson.name;

    }

    return buildersJson;

  }

  private getCollectionJson(basePath: string, packageJson: any) {

    const collectionJson: any = JSON.parse(readFileSync(join(basePath, 'collection.json')).toString('utf-8'));

    for (const schematic of Object.values<any>(collectionJson.schematics)) {

      schematic.schema = JSON.parse(readFileSync(join(basePath, schematic.schema)).toString('utf-8'));
      schematic.name   = packageJson.name;

    }

    return collectionJson;

  }

}

export default Builder.Create();
