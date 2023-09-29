import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsString,
} from 'class-validator';

export class ValueDto {

  @Expose()
  value: any;

}

export class NumberValueDto extends ValueDto {

  @Expose()
  @IsNumber()
  override value!: number;

}

export class StringValueDto extends ValueDto {

  @Expose()
  @IsString()
  override value!: string;

}

export class BooleanValueDto extends ValueDto {

  @Expose()
  @IsBoolean()
  override value!: boolean;

}
