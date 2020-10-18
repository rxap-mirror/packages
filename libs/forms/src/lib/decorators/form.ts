import { FormDefinitionMetadata } from '../model';
import { DefinitionMetadata } from '@rxap/definition';

export function RxapForm(optionsOrId: FormDefinitionMetadata | string, className: string = 'FormDefinition', packageName: string = '@rxap/forms') {

  return function(target: any) {

    DefinitionMetadata(optionsOrId, className, packageName)(target);

  };
}
