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
 * Creates a service which uses the Terminus `HealthIndicatorService` to report the status.
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

  CoerceImports(sourceFile,[
    {
      namedImports: [ 'Injectable' ],
      moduleSpecifier: '@nestjs/common',
    },
    {
      namedImports: [ 'HealthIndicatorResult', 'HealthIndicatorService' ],
      moduleSpecifier: '@nestjs/terminus',
    },
  ]);

}
