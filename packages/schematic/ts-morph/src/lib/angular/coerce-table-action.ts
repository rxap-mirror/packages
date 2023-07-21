import {
  ClassDeclaration,
  Project,
  SourceFile,
  WriterFunctionOrValue,
  Writers,
} from 'ts-morph';
import {
  CoerceMethodClass,
  CoerceMethodClassOptions,
} from './coerce-method-class';
import {
  classify,
  CoerceSuffix,
} from '@rxap/schematics-utilities';
import { CoerceClassImplementation } from '../ts-morph/coerce-class-implementation';
import { chain } from '@angular-devkit/schematics';
import { CoerceTableActionIndexRule } from './coerce-table-action-index';
import { CoerceTableActionIndexProviderRule } from './coerce-table-action-index-provider';
import { CoerceTableActionProviderRule } from './coerce-table-action-provider';
import { CoerceDecorator } from '../ts-morph/coerce-decorator';
import { CoerceImports } from '../ts-morph/coerce-imports';

export interface CoerceTableActionOptions extends Omit<CoerceMethodClassOptions, 'name'> {
  type: string;
  tableName: string;
  refresh?: boolean;
  confirm?: boolean;
  tooltip?: string;
  errorMessage?: string;
  successMessage?: string;
  priority?: number;
  checkFunction?: string;
}

export function CoerceTableActionRule(options: CoerceTableActionOptions) {
  let {
    tableName,
    type,
    refresh,
    confirm,
    tooltip,
    errorMessage,
    successMessage,
    priority,
    checkFunction,
    tsMorphTransform,
  } = options;
  tsMorphTransform ??= () => ({});
  refresh ??= false;
  confirm ??= false;
  priority ??= 0;

  return chain([
    CoerceTableActionIndexProviderRule(options),
    CoerceTableActionIndexRule(options),
    CoerceTableActionProviderRule(options),
    CoerceMethodClass({
      ...options,
      name: CoerceSuffix(type, '-table-row-action'),
      tsMorphTransform: (project: Project, sourceFile: SourceFile, classDeclaration: ClassDeclaration) => {

        const tableInterfaceName = `I${ classify(tableName) }`;

        const optionsObj: Record<string, WriterFunctionOrValue> = {
          type: w => w.quote(type),
          refresh: refresh ? 'true' : 'false',
          confirm: confirm ? 'true' : 'false',
          priority: priority?.toFixed(0) ?? '0',
        };

        if (tooltip) {
          optionsObj['tooltip'] = `$localize\`${ tooltip }\``;
        }
        if (errorMessage) {
          optionsObj['errorMessage'] = w => w.quote(errorMessage!);
        }
        if (successMessage) {
          optionsObj['successMessage'] = w => w.quote(successMessage!);
        }
        if (checkFunction) {
          if (checkFunction.match(/^\([^)]+\)\s*=>/)) {
            optionsObj['checkFunction'] = checkFunction;
          } else {
            optionsObj['checkFunction'] =
              `(element: ${ tableInterfaceName }, index: number, array: ${ tableInterfaceName }[]) => ${ checkFunction }`;
          }
        }

        CoerceDecorator(classDeclaration, 'TableActionMethod').set({
          arguments: [ Writers.object(optionsObj) ],
        });
        CoerceImports(sourceFile, {
          moduleSpecifier: '@rxap/material-table-system',
          namedImports: [ 'TableActionMethod', 'TableRowActionTypeMethod' ],
        });
        CoerceImports(sourceFile, {
          moduleSpecifier: `../../${ tableName }`,
          namedImports: [ tableInterfaceName ],
        });

        CoerceClassImplementation(classDeclaration, `TableRowActionTypeMethod<${ tableInterfaceName }>`);

        return {
          statements: [
            `console.log(\`action row type: ${ type }\`, parameters);`,
            `return parameters;`,
          ],
          isAsync: true,
          parameters: [
            {
              name: 'parameters',
              type: tableInterfaceName,
              hasQuestionToken: false,
            },
          ],
          returnType: `Promise<unknown>`,
          ...tsMorphTransform!(project, sourceFile, classDeclaration),
        };
      },
    }),
  ]);

}
