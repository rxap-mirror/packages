import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizedFormComponentOptions } from '../normalize-form-component-options';
import { formSubmitBackendRule } from './form-submit-backend-rule';
import { formSubmitProviderRule } from './form-submit-provider-rule';

export function formSubmitRule(normalizedOptions: NormalizedFormComponentOptions): Rule {

  const {
    backend,
    controllerName,
    nestModule,
  } = normalizedOptions;

  if ([ BackendTypes.NESTJS ].includes(backend.kind)) {
    return chain([
      formSubmitBackendRule(normalizedOptions),
      formSubmitProviderRule(normalizedOptions),
    ]);
  }

  return noop();


}