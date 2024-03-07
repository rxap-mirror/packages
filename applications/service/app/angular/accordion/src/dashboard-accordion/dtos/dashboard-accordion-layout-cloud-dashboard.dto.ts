import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsArray,
  IsUUID,
} from 'class-validator';

export class DashboardAccordionLayoutCloudDashboardDto {
  @Expose()
  @IsUUID()
  uuid!: string;
  @Expose()
  @IsArray()
  @ApiProperty({
        type: 'unknown'
      })
  layoutList!: Array<unknown>;
}
