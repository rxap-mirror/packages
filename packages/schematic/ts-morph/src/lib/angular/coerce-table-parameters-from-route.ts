import { classify } from '@rxap/schematics-utilities';
import {
  CoerceDependencyInjection,
  CoercePropertyDeclaration,
  Module,
} from '@rxap/ts-morph';
import { Scope } from 'ts-morph';
import {
  TsMorphAngularProjectTransformOptions,
  TsMorphAngularProjectTransformRule,
} from '../ts-morph-transform';
import { CoerceImports } from '../ts-morph/coerce-imports';

export interface CoerceTableParametersFromRouteRuleOptions extends TsMorphAngularProjectTransformOptions {
  parameterList: string[];
  tableName: string;
}

export function CoerceTableParametersFromRouteRule(options: CoerceTableParametersFromRouteRuleOptions) {
  const {
    parameterList,
    tableName,
  } = options;
  return TsMorphAngularProjectTransformRule(options, (project) => {

    const sourceFile = project.getSourceFileOrThrow(`${ tableName }.component.ts`);
    const classDeclaration = sourceFile.getClassOrThrow(`${ classify(tableName) }Component`);

    CoerceDependencyInjection(sourceFile, {
      injectionToken: 'ActivatedRoute',
      parameterName: 'route',
      scope: Scope.Private,
      module: Module.ANGULAR,
    });
    CoerceImports(sourceFile, {
      namedImports: [ 'ActivatedRoute' ],
      moduleSpecifier: '@angular/router',
    });
    CoercePropertyDeclaration(classDeclaration, 'parameters').set({
      scope: Scope.Public,
      isReadonly: true,
      initializer: `input<Observable<Record<string, string>>>(this.route.params.pipe(map(params => ({${ parameterList.map(parameter => `${ parameter }: params.${ parameter }`)
                                                                      .join(', ') }}))))`,
    });
    CoerceImports(sourceFile, {
      namedImports: [ 'Observable' ],
      moduleSpecifier: 'rxjs',
    });
    CoerceImports(sourceFile, {
      namedImports: [ 'map' ],
      moduleSpecifier: 'rxjs/operators',
    });
    CoerceImports(sourceFile, {
      namedImports: [ 'input' ],
      moduleSpecifier: '@angular/core',
    });
  });
}
