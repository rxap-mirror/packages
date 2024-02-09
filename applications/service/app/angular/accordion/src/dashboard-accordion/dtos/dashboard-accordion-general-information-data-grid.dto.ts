import { Expose } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class DashboardAccordionGeneralInformationDataGridDto {
  @Expose()
  @IsNumber()
  name!: number;
}
