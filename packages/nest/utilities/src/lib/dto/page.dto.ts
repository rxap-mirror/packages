import {
  Expose,
  Type,
} from 'class-transformer';
import {
  IsArray,
  IsInstance,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { FilterQueryDto } from '../filter-query.dto';

export abstract class PageDto<RowType> {

  @Expose()
  @IsNumber()
  @Min(0)
  pageSize!: number;

  @Expose()
  @IsNumber()
  @Min(0)
  pageIndex!: number;

  @Expose()
  @IsNumber()
  @Min(0)
  total!: number;

  @Expose()
  @IsString()
  @IsOptional()
  sortDirection?: string;

  @Expose()
  @IsString()
  @IsOptional()
  sortBy?: string;

  @Expose()
  @IsArray()
  @IsInstance(FilterQueryDto, { each: true })
  @Type(() => FilterQueryDto)
  filter?: FilterQueryDto[];

  abstract rows: RowType[];

}
