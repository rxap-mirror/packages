import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import {
  BackendTypes,
  ControlToDtoClassProperty,
} from '@rxap/schematic-angular';
import { CoerceFormSubmitOperation } from '@rxap/schematics-ts-morph';
import { NormalizedFormComponentOptions } from '../normalize-form-component-options';

export function formSubmitBackendRule(normalizedOptions: NormalizedFormComponentOptions): Rule {

  const {
    backend,
    project,
    feature,
    controlList,
    controllerName,
    nestModule,
    shared,
    overwrite,
    identifier,
  } = normalizedOptions;

  switch (backend.kind) {

    case BackendTypes.NESTJS:
      return chain([
        () => console.log(`Coerce form submit operation`),
        CoerceFormSubmitOperation({
          controllerName,
          project,
          overwrite,
          feature,
          shared,
          nestModule,
          idProperty: identifier?.property,
          propertyList: controlList.map(ControlToDtoClassProperty),
          bodyDtoName: controllerName,
          backend,
        }),
      ]);
  }

  return noop();

}