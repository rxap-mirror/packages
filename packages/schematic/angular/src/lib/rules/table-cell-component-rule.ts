import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import {
  CoerceComponentRule,
  CoerceComponentSignalInput,
} from '@rxap/schematics-ts-morph';
import { CoerceSuffix } from '@rxap/schematics-utilities';
import {
  classify,
  dasherize,
} from '@rxap/utilities';
import { NormalizedMinimumTableComponentOptions } from '../normalize-minimum-table-component-options';
import { TableColumnKind } from '../table/table-column-kind';
import { TableColumnModifier } from '../table/table-column-modifier';

export function cellComponentRule(normalizedOptions: NormalizedMinimumTableComponentOptions): Rule {
  const {
    overwrite,
    columnList,
    project,
    feature,
    shared,
    directory,
    componentName,
  } = normalizedOptions;
  if (columnList.some(column => column.kind === TableColumnKind.COMPONENT)) {

    return chain([
      () => console.log(
        `Coerce the table cell components count: ${
          columnList.filter((column) => column.kind === TableColumnKind.COMPONENT).length
        }`,
      ),
      ...columnList
        .filter((column) => column.kind === TableColumnKind.COMPONENT)
        .map((column) =>
          CoerceComponentRule({
            project,
            feature,
            shared,
            name: CoerceSuffix(dasherize(column.name), '-cell'),
            componentOptions: {
              selector: `td[mat-cell][{{prefix}}-${ dasherize(column.name) }-cell]`,
            },
            directory,
            overwrite: overwrite || column.modifiers.includes(TableColumnModifier.OVERWRITE),
            tsMorphTransform: (project, [ sourceFile ], [ classDeclaration ]) => {
              CoerceComponentSignalInput(classDeclaration, 'element', {
                name: `I${ classify(componentName) }`,
                moduleSpecifier: `../${ dasherize(componentName) }`,
              }, { isRequired: true });
              CoerceComponentSignalInput(classDeclaration, 'value', column.type, { isRequired: true });
            },
          }),
        ),
    ]);

  }

  return noop();
}