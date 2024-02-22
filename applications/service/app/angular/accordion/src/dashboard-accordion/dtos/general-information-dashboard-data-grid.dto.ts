import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class GeneralInformationDashboardDataGridDto {
  @Expose()
  @ApiProperty({
        type: 'unknown'
      })
  name!: unknown;
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
