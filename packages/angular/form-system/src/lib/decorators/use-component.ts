import { Constructor } from '@rxap/utilities';
import { FormSystemMetadataKeys } from './metadata-keys';
import { ControlValueAccessor } from '@angular/forms';
import { setMetadataMap } from '@rxap/reflect-metadata';

export function UseComponent<Component extends ControlValueAccessor>(
  component: Constructor<Component>,
  setProperties: Partial<Record<keyof Component, any>> = {},
) {
  return function (target: any, propertyKey: string) {
    setMetadataMap(propertyKey, component, FormSystemMetadataKeys.COMPONENTS, target);
    setMetadataMap(propertyKey, setProperties, FormSystemMetadataKeys.COMPONENTS_PROPERTIES, target);
  };
}
