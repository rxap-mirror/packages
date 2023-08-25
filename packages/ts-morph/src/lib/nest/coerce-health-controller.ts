import {
  Scope,
  SourceFile,
} from 'ts-morph';
import {
  CoerceDependencyInjection,
  Module,
} from '../coerce-dependency-injection';
import { CoerceNestController } from './coerce-nest-controller';

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

  return sourceFile;

}
