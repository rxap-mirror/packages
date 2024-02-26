import { Expose } from 'class-transformer';
import { IsString, IsNumber } from 'class-validator';

export class DashboardAccordionGeneralInformationCloudDashboardDto {
  @Expose()
  @IsString()
  name!: string;
  @Expose()
  @IsString()
  company!: string;
  @Expose()
  @IsNumber()
  dashboardType!: number;
}
