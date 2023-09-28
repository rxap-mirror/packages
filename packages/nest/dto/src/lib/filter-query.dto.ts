import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class FilterQueryDto {

  @Expose()
  @IsString()
  column!: string;

  @Expose()
  @IsString()
  filter!: string;

}
