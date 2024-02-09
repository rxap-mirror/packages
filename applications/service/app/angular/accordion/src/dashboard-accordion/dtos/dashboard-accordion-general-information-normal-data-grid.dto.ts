import { Expose } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class DashboardAccordionGeneralInformationNormalDataGridDto {
  @Expose()
  @IsNumber()
  name!: number;
}
