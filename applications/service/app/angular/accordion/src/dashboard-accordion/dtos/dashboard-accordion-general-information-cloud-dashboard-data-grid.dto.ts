import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class DashboardAccordionGeneralInformationCloudDashboardDataGridDto {
  @Expose()
  @ApiProperty({
        type: 'unknown'
      })
  name!: unknown;
  @Expose()
  @IsString()
  company!: string;
  @Expose()
  @IsNumber()
  dashboardType!: number;
}
