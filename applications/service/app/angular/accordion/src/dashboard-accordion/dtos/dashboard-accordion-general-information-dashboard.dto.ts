import { Expose } from 'class-transformer';
import { IsString, IsNumber } from 'class-validator';

export class DashboardAccordionGeneralInformationDashboardDto {
  @Expose()
  @IsString()
  name!: string;
  @Expose()
  @IsString()
  location!: string;
  @Expose()
  @IsString()
  link!: string;
  @Expose()
  @IsString()
  company!: string;
  @Expose()
  @IsNumber()
  dashboardType!: number;
}
