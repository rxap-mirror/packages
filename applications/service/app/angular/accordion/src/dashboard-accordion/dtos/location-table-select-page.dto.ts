import { FilterQueryDto } from '@rxap/nest-dto';
import { LocationTableSelectRowDto } from './location-table-select-row.dto';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsInstance, IsNumber, IsOptional, IsString } from 'class-validator';

export class LocationTableSelectPageDto {
  @Expose()
  @IsArray()
  @Type(() => LocationTableSelectRowDto)
  @IsInstance(LocationTableSelectRowDto, {
        each: true
      })
  rows!: Array<LocationTableSelectRowDto>;
  @Expose()
  @IsNumber()
  pageSize!: number;
  @Expose()
  @IsNumber()
  pageIndex!: number;
  @Expose()
  @IsNumber()
  total!: number;
  @Expose()
  @IsOptional()
  @IsString()
  sortDirection?: string;
  @Expose()
  @IsOptional()
  @IsString()
  sortBy?: string;
  @Expose()
  @IsArray()
  @Type(() => FilterQueryDto)
  @IsInstance(FilterQueryDto, {
        each: true
      })
  @IsOptional()
  filter?: Array<FilterQueryDto>;
}
