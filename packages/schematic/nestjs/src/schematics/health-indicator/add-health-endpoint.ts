import {
  Scope,
  SourceFile,
} from 'ts-morph';
import { strings } from '@angular-devkit/core';
import { AddDependencyInjection } from '@rxap/schematics-ts-morph';

const { dasherize, classify, camelize, decamelize } = strings;

export function AddHealthEndpoint(
  sourceFile: SourceFile,
  name: string,
) {

  const classDeclaration = sourceFile.getClass('HealthController');

  if (!classDeclaration) {
    throw new Error('FATAL: could not find the HealthController class!');
  }

  const healthIndicatorClass = `${ classify(name) }HealthIndicator`;

  classDeclaration.addMethod({
    name: camelize(name),
    returnType: 'Promise<HealthCheckResult>',
    statements: [
      w => {
        w.writeLine('return this.health.check([');
        w.writeLine(`async () => this.${ camelize(healthIndicatorClass) }.isHealthy(),`);
        w.write(']);');
      },
    ],
    scope: Scope.Public,
    decorators: [
      {
        name: 'Get',
        arguments: [ w => w.quote(dasherize(name)) ],
      },
      {
        name: 'HealthCheck',
        arguments: [],
      },
    ],
  });

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

  AddDependencyInjection(
    sourceFile,
    {
      parameterName: camelize(healthIndicatorClass),
      injectionToken: healthIndicatorClass,
      scope: Scope.Private,
    },
    [
      {
        moduleSpecifier: `./${ dasherize(name) }.health-indicator`,
        namedImports: [ healthIndicatorClass ],
      },
    ],
  );

}
