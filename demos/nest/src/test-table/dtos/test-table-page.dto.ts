import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsInstance,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TestTableRowDto } from './test-table-row.dto';
import { FilterQueryDto } from '@rxap/nest-dto';

export class TestTablePageDto {
  @Expose()
  @IsArray()
  @Type(() => TestTableRowDto)
  @IsInstance(TestTableRowDto, {
    each: true,
  })
  rows!: Array<TestTableRowDto>;
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
    each: true,
  })
  @IsOptional()
  filter?: Array<FilterQueryDto>;
}
