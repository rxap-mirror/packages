import { chain } from '@angular-devkit/schematics';
import {
  CoerceFormDefinition,
  CoerceFormProvidersFile,
} from '@rxap/schematics-ts-morph';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';
import {
  AssertAngularOptionsNameProperty,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../lib/angular-options';
import {
  NormalizedFormDefinitionControl,
  NormalizeFormDefinitionControlList,
} from '../../../lib/form-definition-control';
import { FormDefinitionOptions } from './schema';

export interface NormalizedFormDefinitionOptions
  extends Readonly<Normalized<Omit<FormDefinitionOptions, 'controlList'>> & NormalizedAngularOptions> {
  name: string;
  controlList: ReadonlyArray<NormalizedFormDefinitionControl>;
}

export function NormalizeFormDefinitionOptions(
  options: Readonly<FormDefinitionOptions>,
): Readonly<NormalizedFormDefinitionOptions> {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  AssertAngularOptionsNameProperty(normalizedAngularOptions);
  return Object.freeze({
    ...normalizedAngularOptions,
    controlList: NormalizeFormDefinitionControlList(options.controlList),
    standalone: options.standalone ?? true,
  });
}

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
      () => console.group('\x1b[32m[@rxap/schematics-angular:form-definition]\x1b[0m'),
      () => console.log('Coerce form definition class ...'),
      CoerceFormDefinition({
        project,
        feature,
        directory,
        controlList,
        name,
      }),
      chain(controlList.map(control => ExecuteSchematic('form-control', {
        formName: name,
        project,
        feature,
        directory,
        context,
        nestModule,
        controllerName,
        backend,
        shared,
        scope,
        prefix,
        overwrite,
        replace,
        ...control,
      }))),
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
