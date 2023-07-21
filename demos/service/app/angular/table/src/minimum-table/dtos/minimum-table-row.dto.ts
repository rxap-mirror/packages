import { Expose } from 'class-transformer';
import { IsString, IsNumber, IsBoolean } from 'class-validator';

export class MinimumTableRowDto {
  @Expose()
  @IsNumber()
  __rowId!: string;
  @Expose()
  name!: unknown;
  @Expose()
  @IsNumber()
  age!: number;
  @Expose()
  @IsNumber()
  isActive!: boolean;
  @Expose()
  email!: unknown;
  @Expose()
  @IsNumber()
  rating!: number;
  @Expose()
  accountStatus!: unknown;
}
