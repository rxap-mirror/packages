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
import { DashboardAccordionGeneralInformationDashboardlocationTableSelectRowDto } from './dashboard-accordion-general-information-dashboardlocation-table-select-row.dto';

export class DashboardAccordionGeneralInformationDashboardlocationTableSelectPageDto {
  @Expose()
  @IsArray()
  @Type(() => DashboardAccordionGeneralInformationDashboardlocationTableSelectRowDto)
  @IsInstance(DashboardAccordionGeneralInformationDashboardlocationTableSelectRowDto, {
        each: true
      })
  rows!: Array<DashboardAccordionGeneralInformationDashboardlocationTableSelectRowDto>;
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
