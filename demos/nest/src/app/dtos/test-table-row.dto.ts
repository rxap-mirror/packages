import { Expose } from 'class-transformer';
import { IsString, IsNumber } from 'class-validator';

export class TestTableRowDto {
  @Expose()
  @IsString()
  name!: string;
  @Expose()
  description!: unknown;
  @Expose()
  @IsNumber()
  __rowId!: number;
}
