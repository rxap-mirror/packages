import {
  DataProperty,
  NormalizeDataProperty,
  NormalizedDataProperty,
  TypeNames,
} from '@rxap/ts-morph';
import { Normalized } from '@rxap/utilities';

export interface DtoClassProperty extends DataProperty {
  /**
   * indicates that the @Type decorator should be used as the type of the property is another dto class
   */
  isType?: boolean,
}

export interface NormalizedDtoClassProperty extends Normalized<Pick<DtoClassProperty, 'isType'>>,
                                                    NormalizedDataProperty {
}

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
