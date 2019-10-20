import {
  getMetadata,
  setMetadata,
  KeyValue
} from '@rxap/utilities';
import { FormControlMetaData } from './control';
import { FormDefinitionMetaDataKeys } from './meta-data-keys';

export function RxapControlProperty<PropertyValue>(propertyKey: string, propertyValue: PropertyValue) {
  return function(target: any, pk: string) {
    const control = getMetadata<FormControlMetaData<any>>(FormDefinitionMetaDataKeys.CONTROL, target, pk);

    if (!control) {
      throw new Error(`The RxapFormControl decorator must be called before the RxapControlValidator decorator for propertyKey '${propertyKey}'`);
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

    Object.assign(control.properties, properties);

    setMetadata(FormDefinitionMetaDataKeys.CONTROL, control, target, propertyKey);
  };
}
