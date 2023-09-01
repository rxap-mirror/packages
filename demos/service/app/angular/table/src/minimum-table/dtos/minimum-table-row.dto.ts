import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsString,
} from 'class-validator';

export class MinimumTableRowDto {
  @Expose()
  @IsString()
  __rowId!: string;
  @Expose()
  name!: unknown;
  @Expose()
  @IsNumber()
  age!: number;
  @Expose()
  @IsBoolean()
  isActive!: boolean;
  @Expose()
  email!: unknown;
  @Expose()
  @IsNumber()
  rating!: number;
  @Expose()
  accountStatus!: unknown;
}
