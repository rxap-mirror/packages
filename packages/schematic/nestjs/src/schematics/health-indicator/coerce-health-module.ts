import {
  Project,
  Writers,
} from 'ts-morph';
import {
  AddNestModuleImport,
  AddNestModuleProvider,
  CoerceClass,
  CoerceSourceFile,
  FindNestModuleSourceFile,
} from '@rxap/schematics-ts-morph';

export function CoerceHealthModule(project: Project) {

  const sourceFile = CoerceSourceFile(project, '/app/health/health.module.ts');

  CoerceClass(sourceFile, 'HealthModule', {
    decorators: [
      {
        name: 'Module',
        arguments: [
          Writers.object({}),
        ],
      },
    ],
    isExported: true,
  });

  AddNestModuleImport(sourceFile, 'TerminusModule', [
    {
      moduleSpecifier: '@nestjs/terminus',
      namedImports: [ 'TerminusModule' ],
    },
  ]);

  AddNestModuleProvider(sourceFile, 'Logger', [
    {
      moduleSpecifier: '@nestjs/common',
      namedImports: [ 'Logger' ],
    },
  ]);

  sourceFile.addImportDeclarations([
    {
      moduleSpecifier: '@nestjs/common',
      namedImports: [ 'Module' ],
    },
  ]);

  const appSourceFile = FindNestModuleSourceFile(project, '/app');

  if (appSourceFile) {

    AddNestModuleImport(
      appSourceFile,
      'HealthModule',
      [
        {
          namedImports: [ 'HealthModule' ],
          moduleSpecifier: './health/health.module',
        },
      ],
    );

  }

}
