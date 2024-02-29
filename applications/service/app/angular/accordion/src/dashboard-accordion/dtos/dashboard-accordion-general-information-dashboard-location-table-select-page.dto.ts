import { FilterQueryDto } from '@rxap/nest-dto';
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
} from 'class-validator';
import { DashboardAccordionGeneralInformationDashboardLocationTableSelectRowDto } from './dashboard-accordion-general-information-dashboard-location-table-select-row.dto';

export class DashboardAccordionGeneralInformationDashboardLocationTableSelectPageDto {
  @Expose()
  @IsArray()
  @Type(() => DashboardAccordionGeneralInformationDashboardLocationTableSelectRowDto)
  @IsInstance(DashboardAccordionGeneralInformationDashboardLocationTableSelectRowDto, {
        each: true
      })
  rows!: Array<DashboardAccordionGeneralInformationDashboardLocationTableSelectRowDto>;
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
