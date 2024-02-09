import { Expose } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class DashboardAccordionGeneralInformationSpecialDataGridDto {
  @Expose()
  @IsNumber()
  name!: number;
}
