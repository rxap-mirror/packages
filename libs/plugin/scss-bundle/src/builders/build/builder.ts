import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import { BuildBuilderSchema } from './schema';
import { json } from '@angular-devkit/core';
import { join } from 'path';
import { ReadFile } from './read-file';
import { FileRegistry, BundleResult } from './scss-bundle/interfaces';
import { Bundler } from './scss-bundle/bundler';
import { writeFileSync } from 'fs';
import { EOL } from 'os';

export interface Target extends json.JsonObject {
  project: string;
  target: string;
  configuration: string;
}

export class Builder {
  public static Run(options: BuildBuilderSchema, context: BuilderContext) {
    return new Builder(options, context).run();
  }

  public static Create(): any {
    return createBuilder(Builder.Run);
  }

  constructor(
    public readonly options: BuildBuilderSchema,
    public readonly context: BuilderContext
  ) {}

  public async extractRootPath(project: string): Promise<string> {
    const projectMetadata = await this.context.getProjectMetadata(project);
    const root = projectMetadata.root;

    if (!root || typeof root !== 'string') {
      throw new Error(`Could not extract root path for project '${project}'`);
    }

    return root;
  }

  public async extractOutputPath(
    buildTarget: Target,
    root: string
  ): Promise<string> {
    const buildTargetOptions = await this.context.getTargetOptions(buildTarget);

    const ngPackageFile = buildTargetOptions.project;

    if (!ngPackageFile || typeof ngPackageFile !== 'string') {
      throw new Error(
        `Could not extract ng-package.json for build target '${this.options.buildTarget}'`
      );
    }

    const readFile = new ReadFile();

    const ngPackage = JSON.parse(
      readFile.sync(join(process.cwd(), ngPackageFile))
    );

    const outputPath = join(root, ngPackage.dest);

    if (!outputPath || typeof outputPath !== 'string') {
      throw new Error(
        `Could not extract output path for build target '${this.options.buildTarget}'`
      );
    }

    return outputPath;
  }

  public async run(): Promise<BuilderOutput> {
    if (!this.context.target?.project) {
      throw new Error('The target project is not defined!');
    }

    const buildTarget = this.stringToTarget(this.options.buildTarget);

    const root = await this.extractRootPath(this.context.target?.project);
    const outputPath = await this.extractOutputPath(buildTarget, root);

    const workspaceRoot = this.context.workspaceRoot;

    const fileRegistry: FileRegistry = {};
    const bundler = new Bundler(fileRegistry, workspaceRoot);
    let bundleResult: BundleResult;
    try {
      bundleResult = await bundler.bundle(
        `${root}/src/_index.scss`,
        this.options.dedupeGlobs ?? [],
        this.options.includePaths ?? [],
        this.options.ignoreImports
      );
    } catch (e) {
      return { success: false, error: `Bundle failed: ${e.message}` };
    }

    if (!bundleResult.found) {
      return {
        success: false,
        error: `Entry file was not found:${EOL}${bundleResult.filePath}`,
      };
    }

    this.bundleResultForEach(bundleResult, (result) => {
      if (!result.found && result.tilde && workspaceRoot == null) {
        console.warn(`Found tilde import, but "project" was not specified.`);
        return {
          success: false,
          error: `Import file was not found:${EOL}${result.filePath}`,
        };
      }
    });

    const outFile = `${outputPath}/${this.options.outFile ?? '_theming.scss'}`;

    if (bundleResult.bundledContent == null) {
      return { success: false, error: 'Concatenation result has no content.' };
    }

    writeFileSync(outFile, this.useFix(bundleResult.bundledContent));

    return { success: true };
  }

  private stringToTarget(str: string): Target {
    const split = str.split(':');
    if (split.length < 2) {
      throw new Error(`Can not convert string '${str}' into target`);
    }
    return {
      project: split[0],
      target: split[1],
      configuration: split[2],
    };
  }

  private bundleResultForEach(
    bundleResult: BundleResult,
    cb: (bundleResult: BundleResult) => void
  ): void {
    cb(bundleResult);
    if (bundleResult.imports != null) {
      for (const bundleResultChild of bundleResult.imports) {
        this.bundleResultForEach(bundleResultChild, cb);
      }
    }
  }

  private useFix(content: string): string {
    const useImportMatchList = content.matchAll(
      /@use\s+['"](.+)['"]\s+as\s+(.+);/g
    );

    content = content.replace(/@use\s+['"](.+)['"]\s+as\s+(.+);/g, '');

    const useImportMap = new Map<string, string>();

    for (const useImportMatch of useImportMatchList) {
      const fullMatch = useImportMatch[0];
      const importPath = useImportMatch[1];
      const namespace = useImportMatch[2];

      if (
        useImportMap.has(namespace) &&
        useImportMap.get(namespace) !== importPath
      ) {
        throw new Error(
          `Ensure that each namespace defined with use is unique for each import path. For '${importPath}' and '${useImportMap.get(
            namespace
          )}' with the namespace '${namespace}' is that not given`
        );
      }

      useImportMap.set(namespace, importPath);
    }

    for (const [namespace, importPath] of useImportMap.entries()) {
      content = `@use '${importPath}' as ${namespace};\n` + content;
    }

    return content;
  }
}

export default Builder.Create();
