import { IsArray } from './is-array';
import { IsBoolean } from './is-boolean';
import { IsComplex } from './is-complex';
import { IsDate } from './is-date';
import { IsEmail } from './is-email';
import { IsEnum } from './is-enum';
import { IsInt } from './is-int';
import { IsIP } from './is-ip';
import { _IsNumber as IsNumber } from './is-number';
import { IsObject } from './is-object';
import { IsPhoneNumber } from './is-phone-number';
import { IsPort } from './is-port';
import { IsString } from './is-string';
import { IsUrl } from './is-url';
import { IsUUID } from './is-uuid';

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
  IsUrl,
  IsIP,
  IsPort,
  IsUUID,
};
