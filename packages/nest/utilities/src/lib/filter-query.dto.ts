import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';
import { FilterQuery } from './filter-query.pipe';

export class FilterQueryDto implements FilterQuery {

  @Expose()
  @IsString()
  column!: string;

  @Expose()
  @IsString()
  filter!: string;

}
