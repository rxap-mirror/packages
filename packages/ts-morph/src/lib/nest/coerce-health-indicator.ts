import {
  classify,
  CoerceSuffix,
  dasherize,
} from '@rxap/utilities';
import {
  Scope,
  SourceFile,
} from 'ts-morph';
import { CoerceClass } from '../coerce-class';
import { CoerceImports } from '../coerce-imports';

/**
 * Coerces a custom HealthIndicator class.
 * Creates a service extending `HealthIndicator`.
 *
 * @param sourceFile - The source file to add the indicator to.
 * @param name - The name of the health indicator.
 */
export function CoerceHealthIndicator(sourceFile: SourceFile, name: string) {

  const indicatorClassName = CoerceSuffix(classify(name), 'HealthIndicator');

  CoerceClass(sourceFile, indicatorClassName, {
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

  CoerceImports(sourceFile,[
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
