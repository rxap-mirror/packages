import { TypeNames } from '@rxap/ts-morph';
import {
  DataProperty,
  NormalizeDataProperty,
  NormalizedDataProperty,
} from '../data-property';
import { Normalized } from '@rxap/utilities';

/**
 * Interface representing a property in a DTO class.
 */
export interface DtoClassProperty extends DataProperty {
  /**
   * Indicates that the @Type decorator should be used as the type of the property is another dto class.
   */
  isType?: boolean,
}

export interface NormalizedDtoClassProperty extends Normalized<Pick<DtoClassProperty, 'isType'>>,
                                                    NormalizedDataProperty {
}

/**
 * Normalizes a DTO class property definition.
 *
 * @param property - The DTO class property to normalize.
 * @returns The normalized DTO class property.
 */
export function NormalizeDataClassProperty(property: DtoClassProperty): NormalizedDtoClassProperty {
  const {
    name,
    type,
    isArray,
    memberList,
    source,
    isOptional,
  } = NormalizeDataProperty(property);
  let isType = property.isType ?? false;
  if (([ TypeNames.Self, TypeNames.Deferred ] as string[]).includes(type.name)) {
    isType = true;
  }
  switch (type.name) {
    case 'IconConfig':
      type.name = 'IconDto';
      type.moduleSpecifier = '@rxap/nest-dto';
      isType = true;
      break;
  }
  return {
    source,
    memberList,
    name,
    type,
    isArray,
    isType,
    isOptional,
  };
}
