import { strings } from '@angular-devkit/core';
import {
  chain,
  Rule,
  Tree,
} from '@angular-devkit/schematics';
import {
  ApplyTsMorphProjectRule,
  CoerceSourceFile,
  FixMissingImports,
} from '@rxap/schematics-ts-morph';
import { coerceArray } from '@rxap/schematics-utilities';
import { join } from 'path';
import {
  IndentationText,
  Project,
  QuoteKind,
  SourceFile,
  VariableDeclarationKind,
  Writers,
} from 'ts-morph';
import { AddModuleExport } from './add-module-export';
import { AddModuleProvider } from './add-module-provider';
import { CoerceCollectionEnum } from './coerce-collection-enum';
import { CoerceModuleClass } from './coerce-module-class';
import { CoerceSourceFileRule } from './coerce-source-file-rule';
import { CrudClass } from './crud-class';
import { CreateDtoClass } from './dto-class/create-dto-class';
import { DtoClass } from './dto-class/dto-class';
import { UpdateDtoClass } from './dto-class/update-dto-class';
import { Options } from './options';
import { CrudServiceSchema } from './schema';

export default function (options: CrudServiceSchema): Rule {

  options.collection2 = (options.collection2 ? coerceArray(options.collection2) : []).map(strings.dasherize);

  return async (host: Tree, context) => {

    const basePath = join('libs', options.project, 'src');

    const project = new Project({
      manipulationSettings: {
        indentationText: IndentationText.TwoSpaces,
        quoteKind: QuoteKind.Single,
        useTrailingCommas: true,
      },
      useInMemoryFileSystem: true,
    });

    let generateOptions: Options;
    let camelized: string;
    let classified: string;
    let dasherized: string;
    let dtoName: string;

    if (options.private) {
      const name = [ options.name, options.private ].join('-');
      camelized = strings.camelize(name);
      classified = strings.classify(name);
      dasherized = strings.dasherize(name);
      dtoName = `${ classified }CrudDto`;
      generateOptions = {
        camelized,
        classified,
        dasherized,
        // use the name without the private prefix.
        // bs this document id of parent document should be
        // used and for the current document the static id
        // defined in privateName is used
        documentId: `${ strings.camelize(options.name) }Id`,
        dtoName,
        collection: strings.camelize(options.name),
        parentCollectionList: options.collection2,
        privateName: options.private,
        overwrite: options.overwrite ?? false,
      };
    } else {
      const name = options.name;
      camelized = strings.camelize(name);
      classified = strings.classify(name);
      dasherized = strings.dasherize(name);
      dtoName = `${ classified }CrudDto`;
      generateOptions = {
        camelized,
        classified,
        dasherized,
        documentId: `${ camelized }Id`,
        dtoName,
        collection: dasherized,
        parentCollectionList: options.collection2,
        overwrite: options.overwrite ?? false,
      };
    }

    function AddToIndex(filePaths: string[]): Rule {
      return (tree, context) => {
        CoerceSourceFileRule(project, 'index.ts', basePath)(tree, context);
        const sourceFile = CoerceSourceFile(project, 'index.ts');
        for (const filePath of filePaths) {
          const exportExpression = `export * from '.${ join('/', filePath.replace(/\.ts$/, '')) }';`;
          if (!sourceFile.getFullText().includes(exportExpression)) {
            sourceFile.addStatements(exportExpression);
          }
        }
      };
    }

    function TransformOptionsInitializer(sourceFile: SourceFile) {

      sourceFile.addImportDeclaration({
        namedImports: [ 'ClassTransformOptions' ],
        moduleSpecifier: 'class-transformer',
      });

      sourceFile.addVariableStatement({
        isExported: true,
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: 'crudTransformOptions',
            type: 'ClassTransformOptions',
            initializer: Writers.object({
              enableImplicitConversion: 'true',
              exposeDefaultValues: 'true',
              excludeExtraneousValues: 'true',
              exposeUnsetFields: 'false',
            }),
          },
        ],
      });

      sourceFile.addFunction({
        name: 'CrudTransformOptions',
        isExported: true,
        parameters: [
          {
            name: 'additionalOptions',
            type: 'ClassTransformOptions',
            initializer: '{}',
          },
        ],
        returnType: 'ClassTransformOptions',
        statements: Writers.returnStatement(`{ ...crudTransformOptions, ...additionalOptions, }`),
      });

    }

    function ValidatorOptionsInitializer(sourceFile: SourceFile) {

      sourceFile.addImportDeclaration({
        namedImports: [ 'ValidatorOptions' ],
        moduleSpecifier: 'class-validator',
      });

      sourceFile.addVariableStatement({
        isExported: true,
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: 'crudValidatorOptions',
            type: 'ValidatorOptions',
            initializer: Writers.object({
              enableDebugMessages: 'true',
              skipUndefinedProperties: 'false',
              skipNullProperties: 'false',
              skipMissingProperties: 'false',
              forbidUnknownValues: 'true',
            }),
          },
        ],
      });

      sourceFile.addFunction({
        name: 'CrudValidatorOptions',
        isExported: true,
        parameters: [
          {
            name: 'additionalOptions',
            type: 'ValidatorOptions',
            initializer: '{}',
          },
        ],
        returnType: 'ValidatorOptions',
        statements: Writers.returnStatement(`{ ...crudValidatorOptions, ...additionalOptions, }`),
      });

    }

    return chain([
      CoerceSourceFileRule(project, `lib/${ dasherized }.crud.service.ts`, basePath),
      CoerceSourceFileRule(project, `lib/${ dasherized }/${ dasherized }.crud.dto.ts`, basePath),
      CoerceSourceFileRule(project, `lib/${ dasherized }/create-${ dasherized }.crud.dto.ts`, basePath),
      CoerceSourceFileRule(project, `lib/${ dasherized }/update-${ dasherized }.crud.dto.ts`, basePath),
      CoerceSourceFileRule(project, 'lib/collection.ts', basePath),
      CoerceSourceFileRule(project, 'lib/transform-options.ts', basePath, TransformOptionsInitializer),
      CoerceSourceFileRule(project, 'lib/validator-options.ts', basePath, ValidatorOptionsInitializer),
      CoerceSourceFileRule(project, 'lib/collection.ts', basePath),
      CoerceSourceFileRule(project, 'lib/crud.module.ts', basePath),
      AddToIndex([
        `lib/${ dasherized }.crud.service.ts`,
        `lib/${ dasherized }/${ dasherized }.crud.dto.ts`,
        `lib/${ dasherized }/create-${ dasherized }.crud.dto.ts`,
        `lib/${ dasherized }/update-${ dasherized }.crud.dto.ts`,
        'lib/collection.ts',
        'lib/crud.module.ts',
        'lib/validator-options.ts',
        'lib/transform-options.ts',
      ]),
      () => {
        CoerceCollectionEnum(project, generateOptions.collection);
        generateOptions.parentCollectionList.forEach(collection => CoerceCollectionEnum(project, collection));
        if (options.private) {
          CoerceCollectionEnum(project, 'private');
        }
        CoerceModuleClass(project.getSourceFile(`lib/crud.module.ts`)!, 'Crud', true);
        CrudClass(project.getSourceFile(`lib/${ dasherized }.crud.service.ts`)!, generateOptions);
        DtoClass(project.getSourceFile(`lib/${ dasherized }/${ dasherized }.crud.dto.ts`)!, generateOptions);
        CreateDtoClass(
          project.getSourceFile(`lib/${ dasherized }/create-${ dasherized }.crud.dto.ts`)!,
          generateOptions,
        );
        UpdateDtoClass(
          project.getSourceFile(`lib/${ dasherized }/update-${ dasherized }.crud.dto.ts`)!,
          generateOptions,
        );
        AddModuleProvider(
          project.getSourceFile(`lib/crud.module.ts`)!,
          `${ classified }CrudService`,
          [
            {
              namedImports: [ `${ classified }CrudService` ],
              moduleSpecifier: `./${ dasherized }.crud.service`,
            },
          ],
        );
        AddModuleProvider(
          project.getSourceFile(`lib/crud.module.ts`)!,
          `Logger`,
          [
            {
              namedImports: [ `Logger` ],
              moduleSpecifier: `@nestjs/common`,
            },
          ],
        );
        AddModuleExport(
          project.getSourceFile(`lib/crud.module.ts`)!,
          `${ classified }CrudService`,
          [
            {
              namedImports: [ `${ classified }CrudService` ],
              moduleSpecifier: `./${ dasherized }.crud.service`,
            },
          ],
        );
      },
      ApplyTsMorphProjectRule(project, basePath),
      FixMissingImports(basePath),
    ]);
  };
}
