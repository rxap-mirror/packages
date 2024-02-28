import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsString,
  IsUUID,
} from 'class-validator';

export class DashboardAccordionGeneralInformationDashboardlocationTableSelectRowDto {
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
  @Expose()
  @IsString()
  __rowId!: string;
}
