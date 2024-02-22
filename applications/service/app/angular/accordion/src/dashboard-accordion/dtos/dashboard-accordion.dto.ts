import { Expose } from 'class-transformer';
import { IsUUID, IsNumber, IsString } from 'class-validator';

export class DashboardAccordionDto {
  @Expose()
  @IsUUID()
  uuid!: string;
  @Expose()
  @IsNumber()
  dashboardType!: number;
  @Expose()
  @IsString()
  name!: string;
}
