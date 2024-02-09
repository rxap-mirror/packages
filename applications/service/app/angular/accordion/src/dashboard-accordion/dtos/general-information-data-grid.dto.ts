import { Expose } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GeneralInformationDataGridDto {
  @Expose()
  @IsNumber()
  name!: number;
}
