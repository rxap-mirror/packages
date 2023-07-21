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
    extends: 'HealthIndicator',
    ctors: [
      {
        parameters: [],
        statements: 'super();',
      },
    ],
    methods: [
      {
        name: 'isHealthy',
        isAsync: true,
        scope: Scope.Public,
        returnType: 'Promise<HealthIndicatorResult>',
        statements: [
          `throw new HealthCheckError('Not yet implemented!', this.getStatus('${ dasherize(name) }', false))`,
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
      namedImports: [ 'HealthCheckError', 'HealthIndicator', 'HealthIndicatorResult' ],
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
