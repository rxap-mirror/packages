import { chain } from '@angular-devkit/schematics';
import { PrintAngularOptions } from '../../../lib/print-angular-options';
import { componentRule } from './component-rule';
import { formDefinitionRule } from './form-definition-rule';
import { formSubmitRule } from './form-submit/form-submit-rule';
import {
  NormalizedFormComponentOptions,
  NormalizeFormComponentOptions,
} from './normalize-form-component-options';
import { FormComponentOptions } from './schema';
import { windowRule } from './window-rule';


function printFormComponentOptions(options: NormalizedFormComponentOptions) {
  PrintAngularOptions('form-component', options);
  if (options.controlList.length) {
    console.log(`=== controls: ${ options.controlList.map((c) => c.name).join(', ') }`);
  } else {
    console.log(`=== controls: NONE`);
  }
  console.log(`\x1b[34m===== WINDOW: \x1b[36m${ options.window }\x1b[0m`);
}

export default function (options: FormComponentOptions) {
  const normalizedOptions = NormalizeFormComponentOptions(options);
  printFormComponentOptions(normalizedOptions);
  return function () {
    return chain([
      () => console.group('[@rxap/schematics-angular:form-component]'.green),
      componentRule(normalizedOptions),
      windowRule(normalizedOptions),
      formDefinitionRule(normalizedOptions),
      formSubmitRule(normalizedOptions),
      () => console.groupEnd(),
    ]);
  };
}
