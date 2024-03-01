import {
  DataProperty,
  NormalizeDataProperty,
  NormalizedTypeImport,
  TypeImport,
} from '@rxap/ts-morph';
import { Normalized } from '@rxap/utilities';

export interface DtoClassProperty extends DataProperty {
  /**
   * The type of the property
   *
   * if type = '<self>' the type will be the name of the class
   */
  type: string | TypeImport | '<self>',
  /**
   * indicates that the @Type decorator should be used as the type of the property is another dto class
   */
  isType?: boolean,
}

export interface NormalizedDtoClassProperty extends Normalized<Omit<DtoClassProperty, 'type'>> {
  type: NormalizedTypeImport,
}

export function NormalizeDataClassProperty(property: DtoClassProperty): NormalizedDtoClassProperty {
  const { name , type, isArray } = NormalizeDataProperty(property);
  let isType = property.isType ?? type.name === '<self>' ?? false;
  const isOptional = property.isOptional ?? false;
  switch (type.name) {
    case 'IconConfig':
      type.name = 'IconDto';
      type.moduleSpecifier = '@rxap/nest-dto';
      isType = true;
      break;
  }
  return {
    name,
    type,
    isArray,
    isType,
    isOptional,
  };
}
