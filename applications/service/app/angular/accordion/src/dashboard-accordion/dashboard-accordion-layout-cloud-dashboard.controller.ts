import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { ToDtoInstance } from '@rxap/nest-dto';
import { DashboardAccordionLayoutCloudDashboardDto } from './dtos/dashboard-accordion-layout-cloud-dashboard.dto';

@Controller('dashboard-accordion/:uuid/layout-cloud-dashboard')
export class DashboardAccordionLayoutCloudDashboardController {
  @Get()
  public async getById(@Param('uuid') uuid: string): Promise<DashboardAccordionLayoutCloudDashboardDto> {
    return ToDtoInstance(
    DashboardAccordionLayoutCloudDashboardDto,
    { uuid },
    );
  }
}
