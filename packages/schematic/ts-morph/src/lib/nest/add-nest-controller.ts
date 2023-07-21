import {
  Project,
  SourceFile,
} from 'ts-morph';
import { CoerceClass } from '../coerce-class';
import {
  classify,
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import { CoerceSourceFile } from '../coerce-source-file';
import { FindNestModuleSourceFile } from './find-nest-module-source-file';
import { AddNestModuleController } from './add-nest-module-controller';
import { CoerceImports } from '../ts-morph/coerce-imports';

export interface AddNestControllerOptions {
  prefix?: string;
  addToModule?: boolean;
  modulePath?: string;
  sourceFile?: SourceFile;
}

export function AddNestController(
  project: Project,
  name: string,
  options: AddNestControllerOptions = {},
): SourceFile {

  const sourceFile = options.sourceFile ?? CoerceSourceFile(project, `${ dasherize(name) }.controller.ts`);

  const controllerClass = CoerceSuffix(classify(name), 'Controller');

  CoerceClass(
    sourceFile,
    controllerClass,
    {
      isExported: true,
      decorators: [
        {
          name: 'Controller',
          arguments: [ w => w.quote(options.prefix ?? dasherize(name)) ],
        },
      ],
    },
  );

  CoerceImports(sourceFile, {
    namedImports: [ 'Controller' ],
    moduleSpecifier: '@nestjs/common',
  });

  if (options.addToModule !== false) {

    const modulePath = options.modulePath ?? sourceFile.getDirectoryPath();

    let moduleSourceFile: SourceFile | undefined;

    if (modulePath.match(/\.ts$/)) {
      moduleSourceFile = project.getSourceFile(modulePath)!;
    } else {
      moduleSourceFile = FindNestModuleSourceFile(project, modulePath);
    }

    if (!moduleSourceFile) {
      throw new Error(`Could not find a file at path '${ modulePath }'`);
    }

    AddNestModuleController(
      moduleSourceFile,
      controllerClass,
      [
        {
          namedImports: [ controllerClass ],
          moduleSpecifier: './' + moduleSourceFile.getRelativePathTo(sourceFile).replace(/\.ts$/, ''),
        },
      ],
    );

  }

  return sourceFile;

}
