import { Expose } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GeneralInformationSpecialDataGridDto {
  @Expose()
  @IsNumber()
  name!: number;
}