import {
  camelize,
  classify,
  dasherize,
} from '@rxap/utilities';
import {
  Scope,
  SourceFile,
} from 'ts-morph';
import { CoerceClassMethod } from '../coerce-class-method';
import {
  CoerceDependencyInjection,
  Module,
} from '../coerce-dependency-injection';
import { CoerceImports } from '../coerce-imports';

export function CoerceHealthEndpoint(
  sourceFile: SourceFile,
  name: string,
) {

  const classDeclaration = sourceFile.getClassOrThrow('HealthController');

  const healthIndicatorClass = `${ classify(name) }HealthIndicator`;

  CoerceClassMethod(classDeclaration, camelize(name), {
    returnType: 'Promise<HealthCheckResult>',
    statements: [
      w => {
        w.writeLine('return this.health.check([');
        w.writeLine(`() => this.${ camelize(healthIndicatorClass) }.isHealthy(),`);
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

  CoerceImports(sourceFile,[
    {
      moduleSpecifier: '@nestjs/terminus',
      namedImports: [ 'HealthCheck', 'HealthCheckResult' ],
    },
    {
      moduleSpecifier: '@nestjs/common',
      namedImports: [ 'Get' ],
    },
  ]);

  CoerceDependencyInjection(
    sourceFile,
    {
      parameterName: camelize(healthIndicatorClass),
      injectionToken: healthIndicatorClass,
      scope: Scope.Private,
      module: Module.NEST,
    },
    [
      {
        moduleSpecifier: `./${ dasherize(name) }.health-indicator`,
        namedImports: [ healthIndicatorClass ],
      },
    ],
  );

}
