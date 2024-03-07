import { Expose } from 'class-transformer';
import {
  IsString,
  IsUUID,
} from 'class-validator';

export class DashboardAccordionGeneralInformationDashboardLocationTableSelectDto {
  @Expose()
  @IsString()
  name!: string;
  @Expose()
  @IsUUID()
  uuid!: string;
  @Expose()
  @IsString()
  __value!: string;
  @Expose()
  @IsString()
  __display!: string;
  @Expose()
  @IsString()
  __rowId!: string;
}
