import {
  classify,
  CoerceSuffix,
  dasherize,
} from '@rxap/utilities';
import {
  Scope,
  SourceFile,
} from 'ts-morph';

export function AddHealthIndicator(indicatorSourceFile: SourceFile, name: string) {

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

}
