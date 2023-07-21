import {
  FormDefinitionControl,
  FormDefinitionOptions,
} from './schema';
import { dasherize } from '@rxap/schematics-utilities';
import {
  chain,
  Tree,
} from '@angular-devkit/schematics';
import {
  CoerceFormDefinition,
  CoerceFormProvidersFile,
} from '@rxap/schematics-ts-morph';
import { NormalizeFormControl } from '../form-component';
import { WriterFunction } from 'ts-morph';

export interface NormalizedFormDefinitionOptions extends FormDefinitionOptions {
  controlList: Array<Required<FormDefinitionControl>>;
}

export function NormalizeFormControlType(control: {
  type?: string | WriterFunction;
  state?: string | WriterFunction;
}): {
  type: string | WriterFunction;
  isArray: boolean;
  state: string | WriterFunction;
} {
  let isArray = false;
  let type = control.type;
  let state = control.state;
  if (type && typeof type === 'string') {
    isArray = type.endsWith('[]') || type.startsWith('Array<');
    type = type.replace(/\[]$/, '').replace(/^Array<(.+)>/, '$1');
    if (![ 'string', 'boolean', 'number', 'unknown' ].includes(type)) {
      switch (type) {
        case 'date':
          type = 'string';
          break;
        case 'uuid':
          type = 'string';
          break;
        default:
          type = 'unknown';
          break;
      }
    }
  }
  if (isArray) {
    if (typeof state === 'string' && !state?.match(/^\[.+]$/)) {
      console.warn(
        `The state of the control is not an array! Overwrite with '[]'`,
      );
      state = '[]';
    }
  }
  return {
    type: type ?? 'unknown',
    isArray,
    state,
  };
}

export function NormalizeFormDefinitionControl(
  control: string | FormDefinitionControl,
): Required<FormDefinitionControl> {
  const nControl = NormalizeFormControl(control);
  const {
    name,
    isRequired,
    validatorList,
  } = nControl;
  const {
    type,
    state,
    isArray,
  } = NormalizeFormControlType(nControl);
  return {
    name,
    type,
    isArray,
    isRequired,
    state,
    validatorList,
  };
}

export function NormalizeFormDefinitionControlList(
  controlList: Array<string | FormDefinitionControl>,
): Array<Required<FormDefinitionControl>> {
  return controlList.map(NormalizeFormDefinitionControl);
}

export function NormalizeFormDefinitionOptions(
  options: Readonly<FormDefinitionOptions>,
): Readonly<NormalizedFormDefinitionOptions> {
  let shared: boolean = options.shared ?? false;
  let project = dasherize(options.project ?? 'shared');
  if (project === 'shared') {
    shared = true;
  }
  if (shared) {
    project = 'shared';
  }
  return Object.seal({
    name: dasherize(options.name),
    project: project,
    feature: dasherize(options.feature),
    shared: shared,
    directory: options.directory ?? '',
    controlList: NormalizeFormDefinitionControlList(options.controlList),
  });
}

export default function (options: FormDefinitionOptions) {
  const normalizedOptions = NormalizeFormDefinitionOptions(options);
  const {
    name,
    project,
    directory,
    feature,
    controlList,
  } = normalizedOptions;
  console.log(
    `===== Generate form definition '${ name }' in project '${ project }' and feature '${ feature }' in directory '${ directory }' ...`,
  );

  return (host: Tree) => {
    return chain([
      () => console.log('Coerce form definition class ...'),
      CoerceFormDefinition({
        project,
        feature,
        directory,
        controlList,
        name,
      }),
      () => console.log('Coerce form providers file ...'),
      CoerceFormProvidersFile({
        project,
        feature,
        directory,
        name,
      }),
    ]);
  };
}
