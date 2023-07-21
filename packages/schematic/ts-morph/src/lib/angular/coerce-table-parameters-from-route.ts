import { classify } from '@rxap/schematics-utilities';
import { Scope } from 'ts-morph';
import { CoerceClassConstructor } from '../coerce-class-constructor';
import { CoercePropertyDeclaration } from '../nest/coerce-dto-class';
import {
  TsMorphAngularProjectTransformOptions,
  TsMorphAngularProjectTransformRule,
} from '../ts-morph-transform';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceParameterDeclaration } from '../ts-morph/coerce-parameter-declaration';

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

    const [ constructorDeclaration ] = CoerceClassConstructor(classDeclaration);
    CoerceParameterDeclaration(
      constructorDeclaration,
      'route',
      {
        type: 'ActivatedRoute',
        isReadonly: true,
        scope: Scope.Private,
      },
    );
    CoerceImports(sourceFile, {
      namedImports: [ 'ActivatedRoute' ],
      moduleSpecifier: '@angular/router',
    });
    CoercePropertyDeclaration(classDeclaration, 'parameters').set({
      type: 'Observable<Record<string, string>>',
      initializer: `this.route.params.map(params => ({${ parameterList.map(parameter => `${ parameter }: params.${ parameter }`)
                                                                      .join(', ') }}))`,
      decorators: [
        {
          name: 'Input',
          arguments: [],
        },
      ],
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
      namedImports: [ 'Input' ],
      moduleSpecifier: '@angular/core',
    });
  });
}
