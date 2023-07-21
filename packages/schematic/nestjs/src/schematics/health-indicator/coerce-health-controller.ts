import {
  Project,
  Scope,
  SourceFile,
} from 'ts-morph';
import {
  AddDependencyInjection,
  AddNestController,
  CoerceSourceFile,
  Module,
} from '@rxap/schematics-ts-morph';

export function CoerceHealthController(project: Project): SourceFile {

  const sourceFile = CoerceSourceFile(project, '/app/health/health.controller.ts');

  AddNestController(
    project,
    'health',
    {
      sourceFile,
    },
  );

  AddDependencyInjection(sourceFile, {
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
