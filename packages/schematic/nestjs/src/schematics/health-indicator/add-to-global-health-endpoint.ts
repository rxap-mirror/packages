import {
  ArrayLiteralExpression,
  MethodDeclaration,
  Scope,
  SourceFile,
} from 'ts-morph';
import { strings } from '@angular-devkit/core';
import { CoerceClassMethod } from '@rxap/schematics-ts-morph';

const { dasherize, classify, camelize, decamelize } = strings;

export function AddToGlobalHealthEndpoint(
  sourceFile: SourceFile,
  name: string,
) {

  const classDeclaration = sourceFile.getClass('HealthController');

  if (!classDeclaration) {
    throw new Error('FATAL: could not find the HealthController class!');
  }

  const healthIndicatorClass = `${ classify(name) }HealthIndicator`;

  const methodDeclaration: MethodDeclaration = CoerceClassMethod(
    classDeclaration,
    'healthCheck',
    {
      scope: Scope.Public,
      returnType: 'Promise<HealthCheckResult>',
      statements: [
        w => {
          w.writeLine('return this.health.check([');
          w.write(']);');
        },
      ],
      decorators: [
        {
          name: 'Get',
          arguments: [],
        },
        {
          name: 'HealthCheck',
          arguments: [],
        },
      ],
    },
  );

  sourceFile.addImportDeclarations([
    {
      moduleSpecifier: '@nestjs/terminus',
      namedImports: [ 'HealthCheck', 'HealthCheckResult' ],
    },
    {
      moduleSpecifier: '@nestjs/common',
      namedImports: [ 'Get' ],
    },
  ]);

  const statement = methodDeclaration.getStatements().find(e => e.getFullText().match(/return this\.health\.check/));

  const array = statement?.getChildAtIndex(1)?.getChildAtIndex(2)?.getFirstChild();

  if (array instanceof ArrayLiteralExpression) {
    array.addElement(w => {
      w.write(`async () => this.${ camelize(healthIndicatorClass) }.isHealthy()`);
    });
  }

}
