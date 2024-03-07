import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class DashboardAccordionGeneralInformationDashboardSubmitDto {
  @Expose()
  @IsString()
  name!: string;
  @Expose()
  @IsString()
  location!: string;
  @Expose()
  @IsString()
  link!: string;
}
