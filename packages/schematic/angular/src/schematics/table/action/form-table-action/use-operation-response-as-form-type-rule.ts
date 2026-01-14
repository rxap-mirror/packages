import { Rule } from '@angular-devkit/schematics';
import { CoerceTypeAlias } from '@rxap/schematic-angular';
import { TsMorphAngularProjectTransformRule } from '@rxap/schematics-ts-morph';
import {
  CoerceImports,
  OperationIdToResponseClassImportPath,
  OperationIdToResponseClassName,
} from '@rxap/ts-morph';
import {
  classify,
  CoerceSuffix,
} from '@rxap/utilities';
import { TsMorphAngularProjectTransformOptions } from '@rxap/workspace-ts-morph';

interface UseOperationResponseAsFormTypeRuleOptions
  extends TsMorphAngularProjectTransformOptions {
  name: string;
  operationId: string;
  scope?: string | null;
}

export function UseOperationResponseAsFormTypeRule(
  options: UseOperationResponseAsFormTypeRuleOptions,
): Rule {
  const {
    name,
    operationId,
    scope,
  } = options;

  const className = CoerceSuffix(classify(name), 'Form');
  const interfaceName = `I${ className }`;

  return TsMorphAngularProjectTransformRule(options, (project, [ sourceFile ]) => {

    const interfaceDeclaration = sourceFile.getInterface(interfaceName);
    if (interfaceDeclaration) {
      interfaceDeclaration.remove();
    }

    CoerceTypeAlias(sourceFile, interfaceName, {
      type: OperationIdToResponseClassName(operationId),
      isExported: true,
    }).set({ type: OperationIdToResponseClassName(operationId) });

    CoerceImports(sourceFile, {
      namedImports: [ OperationIdToResponseClassName(operationId) ],
      moduleSpecifier: OperationIdToResponseClassImportPath(operationId, scope),
    });
  }, [ '/' + CoerceSuffix(name, '.form.ts') ]);
}