import { Expose } from 'class-transformer';
import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DashboardAccordionGeneralInformationDashboardLocationTableSelectRowDto {
  @Expose()
  @IsString()
  __rowId!: string;
  @Expose()
  @IsString()
  __value!: string;
  @Expose()
  @IsString()
  __display!: string;
  @Expose()
  @ApiProperty({
        type: 'unknown'
      })
  name!: unknown;
  @Expose()
  @IsUUID()
  uuid!: string;
}
