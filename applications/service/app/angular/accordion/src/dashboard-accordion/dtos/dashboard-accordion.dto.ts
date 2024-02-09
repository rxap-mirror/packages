import { Expose } from 'class-transformer';
import { IsUUID, IsString } from 'class-validator';

export class DashboardAccordionDto {
  @Expose()
  @IsUUID()
  uuid!: string;
  @Expose()
  @IsString()
  name!: string;
}
