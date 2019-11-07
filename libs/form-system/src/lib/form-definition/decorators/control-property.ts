import {
  getMetadata,
  setMetadata,
  KeyValue
} from '@rxap/utilities';
import { FormControlMetaData } from './control';
import { FormDefinitionMetaDataKeys } from './meta-data-keys';

export const PROHIBITED_PROPERTY_KEYS = [
  'formId',
  'controlId'
];

export function RxapControlProperty<PropertyValue>(propertyKey: string, propertyValue: PropertyValue) {
  return function(target: any, pk: string) {
    const control = getMetadata<FormControlMetaData<any>>(FormDefinitionMetaDataKeys.CONTROL, target, pk);

    if (!control) {
      throw new Error(`The RxapFormControl decorator must be called before the RxapControlValidator decorator for propertyKey '${propertyKey}'`);
    }

    if (PROHIBITED_PROPERTY_KEYS.includes(propertyKey)) {
      throw new Error(`Control property '${propertyKey}' is not allowed`);
    }

    control.properties[ propertyKey ] = propertyValue;

    setMetadata(FormDefinitionMetaDataKeys.CONTROL, control, target, pk);

  };
}

export function RxapControlProperties(properties: KeyValue) {
  return function(target: any, propertyKey: string) {
    const control = getMetadata<FormControlMetaData<any>>(FormDefinitionMetaDataKeys.CONTROL, target, propertyKey);

    if (!control) {
      throw new Error(`The RxapFormControl decorator must be called before the RxapControlValidator decorator for propertyKey '${propertyKey}'`);
    }

    if (Object.keys(properties).some(pk => PROHIBITED_PROPERTY_KEYS.includes(pk))) {
      throw new Error(`Control properties '${Object.keys(properties).filter(pk => PROHIBITED_PROPERTY_KEYS.includes(pk)).join(', ')}' are not allowed`);
    }

    Object.assign(control.properties, properties);

    setMetadata(FormDefinitionMetaDataKeys.CONTROL, control, target, propertyKey);
  };
}
