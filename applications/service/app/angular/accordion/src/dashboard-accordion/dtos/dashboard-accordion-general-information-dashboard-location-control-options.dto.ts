import { Expose } from 'class-transformer';
import {
  IsString,
  IsUUID,
} from 'class-validator';

export class DashboardAccordionGeneralInformationDashboardLocationControlOptionsDto {
  @Expose()
  @IsString()
  name!: string;
  @Expose()
  @IsUUID()
  uuid!: string;
  @Expose()
  @IsString()
  value!: string;
  @Expose()
  @IsString()
  display!: string;
}
