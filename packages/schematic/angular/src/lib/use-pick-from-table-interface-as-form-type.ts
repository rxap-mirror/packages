import { Rule } from '@angular-devkit/schematics';
import {
  CoerceImports,
  TsMorphAngularProjectTransformOptions,
  TsMorphAngularProjectTransformRule,
} from '@rxap/schematics-ts-morph';
import { CoerceSuffix } from '@rxap/schematics-utilities';
import {
  camelize,
  classify,
  dasherize,
} from '@rxap/utilities';
import { CoerceTypeAlias } from '../schematics/table/action/form-table-action';
import { NormalizedTableColumn } from './table-column';

export interface UsePickFromTableInterfaceAsFormTypeRuleOptions
  extends TsMorphAngularProjectTransformOptions {
  name: string;
  formName: string;
  columnList: ReadonlyArray<NormalizedTableColumn>;
  suffix?: string;
}

export function UsePickFromTableInterfaceAsFormTypeRule(
  options: UsePickFromTableInterfaceAsFormTypeRuleOptions,
): Rule {
  const {
    name,
    columnList,
    formName,
    suffix = 'table',
  } = options;

  const className = CoerceSuffix(classify(formName), 'Form');
  const interfaceName = `I${ className }`;
  const tableInterfaceName = `I${ classify(name) }${classify(suffix)}`;

  return TsMorphAngularProjectTransformRule(options, (project, [ sourceFile ]) => {

    const interfaceDeclaration = sourceFile.getInterface(interfaceName);
    if (interfaceDeclaration) {
      interfaceDeclaration.remove();
    }

    const type = `Pick<${ tableInterfaceName }, ${ columnList.filter(c => c.hasFilter)
      .map(c => `'${ camelize(c.name) }'`)
      .join(' | ') }>`;

    CoerceTypeAlias(sourceFile, interfaceName, {
      type,
      isExported: true,
    }).set({ type });

    CoerceImports(sourceFile, {
      namedImports: [ tableInterfaceName ],
      moduleSpecifier: `./${ name }-${dasherize(suffix)}`,
    });
  }, [ '/' + CoerceSuffix(formName, '.form.ts') ]);
}
