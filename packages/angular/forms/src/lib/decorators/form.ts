import { DefinitionMetadata } from '@rxap/definition';
import { FormDefinitionMetadata } from '../model';

export function RxapForm(
  optionsOrId: FormDefinitionMetadata | string,
  className = 'FormDefinition',
  packageName = '@rxap/forms',
) {

  return function (target: any) {

    DefinitionMetadata(optionsOrId, className, packageName)(target);

  };
}
