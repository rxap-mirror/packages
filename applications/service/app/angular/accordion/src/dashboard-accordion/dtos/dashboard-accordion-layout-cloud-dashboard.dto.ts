import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class DashboardAccordionLayoutCloudDashboardDto {
  @Expose()
  @IsUUID()
  uuid!: string;
}
