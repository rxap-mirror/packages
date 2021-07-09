import { ElementParserMetaData } from './metadata-keys';
import { mergeWithMetadata } from '@rxap/utilities/reflect-metadata';

export function RequiredProperty(message?: string) {
  return function(target: any, propertyKey: string) {
    mergeWithMetadata(
      ElementParserMetaData.REQUIRED_ELEMENT_PROPERTIES,
      { [ propertyKey ]: message || `Element property '${propertyKey}' is required.` },
      target
    );
  };
}
