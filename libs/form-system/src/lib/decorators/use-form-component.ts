import {
  Constructor,
  setMetadata,
} from '@rxap/utilities';
import { FormSystemMetadataKeys } from './metadata-keys';

/**
 * Links a component with a form definition
 *
 * @param component
 */
export function UseFormComponent(component: Constructor) {
  return function (target: any) {
    setMetadata(FormSystemMetadataKeys.FORM_COMPONENT, component, target);
  };
}
