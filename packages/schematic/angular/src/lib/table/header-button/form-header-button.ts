import { Normalized } from '@rxap/utilities';
import {
  FormComponent,
  NormalizedFormComponent,
  NormalizeFormComponent,
} from '../../form/form-component';
import { HeaderButtonKind } from '../header-button-kind';
import {
  BaseHeaderButton,
  NormalizeBaseHeaderButton,
  NormalizedBaseHeaderButton,
} from './base-header-button';

export interface FormHeaderButton extends BaseHeaderButton {
  form?: FormComponent;
}

export interface NormalizedFormHeaderButton extends Readonly<Normalized<Omit<FormHeaderButton, keyof BaseHeaderButton | 'form'>> & NormalizedBaseHeaderButton> {
  kind: HeaderButtonKind.FORM;
  form: NormalizedFormComponent;
}

export function IsFormHeaderButton(header: BaseHeaderButton): header is FormHeaderButton {
  return header.kind === HeaderButtonKind.FORM;
}

export function IsNormalizedFormHeaderButton(header: NormalizedBaseHeaderButton): header is NormalizedFormHeaderButton {
  return header.kind === HeaderButtonKind.FORM;
}

export function NormalizeFormHeaderButton(options: FormHeaderButton, label?: string): NormalizedFormHeaderButton {
  if (!options.form) {
    throw new Error('The form property is required for a form header button');
  }
  return Object.freeze({
    ...NormalizeBaseHeaderButton(options),
    kind: HeaderButtonKind.FORM,
    form: NormalizeFormComponent(options.form),
    icon: options.icon ?? !options.svgIcon ? 'add' : null,
    label: options.label ?? `Create ${ label }` ?? null,
  });
}
