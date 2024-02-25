import { Expose } from 'class-transformer';
import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DashboardAccordionGeneralInformationDashboardDataGridDto {
  @Expose()
  @IsString()
  name!: string;
  @Expose()
  @ApiProperty({
        type: 'unknown'
      })
  location!: unknown;
  @Expose()
  @IsString()
  link!: string;
  @Expose()
  @IsString()
  company!: string;
  @Expose()
  @IsNumber()
  dashboardType!: number;
}
