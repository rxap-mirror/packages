import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsString,
} from 'class-validator';

/**
 * Represents a value DTO.
 */
export class ValueDto {

  @Expose()
  value: any;

}

/**
 * Represents a DTO for a number value.
 * @class
 * @extends ValueDto
 */
export class NumberValueDto extends ValueDto {

  @Expose()
  @IsNumber()
  override value!: number;

}

/**
 * Represents a string value DTO.
 * @extends ValueDto
 */
export class StringValueDto extends ValueDto {

  @Expose()
  @IsString()
  override value!: string;

}

/**
 * Represents a boolean value data transfer object.
 */
export class BooleanValueDto extends ValueDto {

  @Expose()
  @IsBoolean()
  override value!: boolean;

}
