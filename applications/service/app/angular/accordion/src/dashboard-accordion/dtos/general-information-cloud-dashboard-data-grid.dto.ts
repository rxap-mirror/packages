import { Expose } from 'class-transformer';
import { IsString, IsNumber } from 'class-validator';

export class GeneralInformationCloudDashboardDataGridDto {
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
