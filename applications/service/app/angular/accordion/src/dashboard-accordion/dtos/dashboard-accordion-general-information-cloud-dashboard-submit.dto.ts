import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class DashboardAccordionGeneralInformationCloudDashboardSubmitDto {
  @Expose()
  @IsString()
  name!: string;
}
