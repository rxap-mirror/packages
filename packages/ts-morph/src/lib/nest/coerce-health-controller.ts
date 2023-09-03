import {
  Scope,
  SourceFile,
} from 'ts-morph';
import { CoerceDecorator } from '../coerce-decorator';
import {
  CoerceDependencyInjection,
  Module,
} from '../coerce-dependency-injection';
import { CoerceImports } from '../coerce-imports';
import { CoerceNestController } from './coerce-nest-controller';
import { CoerceNestOperation } from './coerce-nest-operation';

export function CoerceHealthController(sourceFile: SourceFile): SourceFile {

  CoerceNestController(sourceFile, { name: 'health', path: 'health' });

  CoerceDependencyInjection(sourceFile, {
    injectionToken: 'HealthCheckService',
    parameterName: 'health',
    scope: Scope.Private,
    module: Module.NEST,
  }, [
    {
      namedImports: [ 'HealthCheckService' ],
      moduleSpecifier: '@nestjs/terminus',
    },
  ]);

  CoerceNestOperation(sourceFile, {
    method: 'get',
    returnType: 'Promise<HealthCheckResult>',
    statements: [ 'return this.health.check([]);' ],
    operationName: 'healthCheck',
    tsMorphTransform: (_, __, methodDeclaration) => {
      CoerceDecorator(methodDeclaration, 'HealthCheck', { arguments: [] });
    },
  });

  CoerceImports(sourceFile, [
    {
      namedImports: [ 'HealthCheckResult', 'HealthCheck' ],
      moduleSpecifier: '@nestjs/terminus',
    },
  ]);

  return sourceFile;

}
