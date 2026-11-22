import { CoerceSuffix } from '@rxap/schematics-utilities';
import {
  Project,
  Scope,
} from 'ts-morph';
import { strings } from '@angular-devkit/core';
import {
  AddNestModuleProvider,
  FindNestModuleSourceFile,
} from '@rxap/schematics-ts-morph';

const { dasherize, classify } = strings;

export function AddHealthIndicator(project: Project, name: string) {
  const indicatorSourceFile = project.createSourceFile(`/app/health/${ dasherize(name) }.health-indicator.ts`);

  const indicatorClassName = CoerceSuffix(classify(name), 'HealthIndicator');

  indicatorSourceFile.addClass({
    name: indicatorClassName,
    isExported: true,
    decorators: [
      {
        name: 'Injectable',
        arguments: [],
      },
    ],
    ctors: [
      {
        parameters: [
          {
            name: 'healthIndicatorService',
            type: 'HealthIndicatorService',
            scope: Scope.Private,
            isReadonly: true,
          },
        ],
      },
    ],
    methods: [
      {
        name: 'isHealthy',
        isAsync: true,
        scope: Scope.Public,
        returnType: 'Promise<HealthIndicatorResult>',
        statements: [
          `const indicator = this.healthIndicatorService.check('${ dasherize(name) }');`,
          `return indicator.down({ message: 'Not yet implemented!' });`,
        ],
      },
    ],
  });

  indicatorSourceFile.addImportDeclarations([
    {
      namedImports: [ 'Injectable' ],
      moduleSpecifier: '@nestjs/common',
    },
    {
      namedImports: [ 'HealthIndicatorResult', 'HealthIndicatorService' ],
      moduleSpecifier: '@nestjs/terminus',
    },
  ]);

  const moduleSourceFile = FindNestModuleSourceFile(project, '/app/health');

  if (moduleSourceFile) {
    AddNestModuleProvider(
      moduleSourceFile,
      indicatorClassName,
      [
        {
          namedImports: [ indicatorClassName ],
          moduleSpecifier: `./${ dasherize(name) }.health-indicator`,
        },
      ],
    );
  }
}
