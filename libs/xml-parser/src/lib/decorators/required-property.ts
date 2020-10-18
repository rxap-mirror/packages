import { mergeWithMetadata } from '@rxap/utilities';
import { ElementParserMetaData } from './metadata-keys';

export function RequiredProperty(message?: string) {
  return function(target: any, propertyKey: string) {
    mergeWithMetadata(
      ElementParserMetaData.REQUIRED_ELEMENT_PROPERTIES,
      { [ propertyKey ]: message || `Element property '${propertyKey}' is required.` },
      target
    );
  };
}
