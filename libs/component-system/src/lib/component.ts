import { setMetadata } from '@rxap/utilities';
import { ComponentMetaDataKeys } from './metadata-keys';

export function RxapComponent(id: string) {
  return function(target: any) {
    setMetadata(ComponentMetaDataKeys.COMPONENT_ID, id, target);
  };
}
