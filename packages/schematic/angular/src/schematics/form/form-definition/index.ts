import { chain } from '@angular-devkit/schematics';
import {
  CoerceFormDefinition,
  CoerceFormProvidersFile,
} from '@rxap/schematics-ts-morph';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import { AbstractControlRolls } from '../../../lib/form/abstract-control';
import { PrintAngularOptions } from '../../../lib/print-angular-options';
import {
  NormalizedFormDefinitionOptions,
  NormalizeFormDefinitionOptions,
} from './normalize-form-definition-options';
import { FormDefinitionOptions } from './schema';

function printFormDefinitionOptions(options: NormalizedFormDefinitionOptions) {
  PrintAngularOptions('form-definition', options);
  if (options.controlList.length) {
    console.log(`=== controls: ${ options.controlList.map((c) => c.name).join(', ') }`);
  } else {
    console.log(`=== controls: NONE`);
  }
}

export default function (options: FormDefinitionOptions) {
  const normalizedOptions = NormalizeFormDefinitionOptions(options);
  const {
    name,
    project,
    directory,
    feature,
    controlList,
    standalone,
    context,
    nestModule,
    controllerName,
    backend,
    shared,
    scope,
    prefix,
    overwrite,
    replace,
  } = normalizedOptions;
  printFormDefinitionOptions(normalizedOptions);
  return () => {
    return chain([
      () => console.group('[@rxap/schematics-angular:form-definition]'.green),
      () => console.log('Coerce form definition class ...'),
      CoerceFormDefinition({
        project,
        feature,
        directory,
        controlList,
        name,
      }),
      chain(controlList.map(control => {
        const inputOptions = {
          formName: name,
          project,
          feature,
          directory,
          context,
          nestModule,
          controllerName,
          shared,
          scope,
          prefix,
          overwrite,
          replace,
          ...control,
        };
        switch (control.role) {

          case AbstractControlRolls.CONTROL:
            return ExecuteSchematic('form-control', inputOptions);

          case AbstractControlRolls.ARRAY:
            return ExecuteSchematic('form-array', inputOptions);

          case AbstractControlRolls.GROUP:
            return ExecuteSchematic('form-group', inputOptions);

          default:
            return () => console.log(`No schematic for control role: ${ (control as any).role }`.yellow);

        }

      })),
      standalone ?
      chain([
        () => console.log('Coerce form providers file ...'),
        CoerceFormProvidersFile({
          project,
          feature,
          directory,
          name,
        }),
      ]) :
      chain([
        () => console.log('Skip form providers file ...'),
      ]),
      () => console.groupEnd(),
    ]);
  };
}
