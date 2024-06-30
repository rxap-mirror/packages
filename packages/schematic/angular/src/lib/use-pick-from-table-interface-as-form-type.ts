import { Rule } from '@angular-devkit/schematics';
import {
  TsMorphAngularProjectTransformRule,
} from '@rxap/schematics-ts-morph';
import { CoerceSuffix } from '@rxap/schematics-utilities';
import { CoerceImports } from '@rxap/ts-morph';
import {
  camelize,
  classify,
  dasherize,
} from '@rxap/utilities';
import { TsMorphAngularProjectTransformOptions } from '@rxap/workspace-ts-morph';
import {
  WriterFunction,
  Writers,
} from 'ts-morph';
import { CoerceTypeAlias } from '../schematics/table/action/form-table-action';
import { NormalizedFormControl } from './form/control/form-control';
import { NormalizedTableColumn } from './table/table-column';

export interface UsePickFromTableInterfaceAsFormTypeRuleOptions
  extends TsMorphAngularProjectTransformOptions {
  name: string;
  formName: string;
  columnList: ReadonlyArray<NormalizedTableColumn>;
  filterList: ReadonlyArray<NormalizedFormControl>;
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
    filterList,
  } = options;

  const className = CoerceSuffix(classify(formName), 'Form');
  const interfaceName = `I${ className }`;
  const tableInterfaceName = `I${ classify(name) }${classify(suffix)}`;

  return TsMorphAngularProjectTransformRule(options, (project, [ sourceFile ]) => {

    const interfaceDeclaration = sourceFile.getInterface(interfaceName);
    if (interfaceDeclaration) {
      interfaceDeclaration.remove();
    }

    const type: WriterFunction = w => {
      const hasFilterWithAlternativeColumnType = (c: NormalizedTableColumn) => c.hasFilter && c.filterControl?.type.name && c.filterControl?.type.name !== c.type.name;
      if (columnList.some(c => c.hasFilter)) {
        w.write(`Pick<${ tableInterfaceName }, ${ columnList.filter(c => c.hasFilter && !hasFilterWithAlternativeColumnType(c))
          .map(c => `'${ camelize(c.name) }'`)
          .join(' | ') }>`);
      }
      if (columnList.some(hasFilterWithAlternativeColumnType)) {
        w.write(' & ');
        Writers.objectType({
          properties: columnList.filter(hasFilterWithAlternativeColumnType).map(c => ({ name: camelize(c.name), type: c.filterControl?.type.name })),
        })(w);
      }
      if (filterList.length && columnList.some(c => c.hasFilter)) {
        w.write(' & ');
      }
      if (filterList.length) {
        Writers.objectType({
          properties: filterList.map(control => ({ name: camelize(control.name), type: control.type.name })),
        })(w);
      }
    };

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
