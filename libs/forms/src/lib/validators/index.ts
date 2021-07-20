import { _IsNumber as IsNumber } from './is-number';
import { IsBoolean } from './is-boolean';
import { IsObject } from './is-object';
import { IsString } from './is-string';
import { IsInt } from './is-int';
import { IsEnum } from './is-enum';
import { IsDate } from './is-date';
import { IsArray } from './is-array';
import { IsComplex } from './is-complex';
import { IsPhoneNumber } from './is-phone-number';
import { IsEmail } from './is-email';
import { IsUrl } from './is-url';

export const RxapValidators = {
  IsNumber,
  IsBoolean,
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsObject,
  IsString,
  IsComplex,
  IsPhoneNumber,
  IsEmail,
  IsUrl
};
