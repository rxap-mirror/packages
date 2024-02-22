import { Controller, Get, NotImplementedException, Param } from '@nestjs/common';
import { DashboardAccordionLayoutCloudDashboardDto } from './dtos/dashboard-accordion-layout-cloud-dashboard.dto';

@Controller('dashboard-accordion/:uuid/layout-cloud-dashboard')
export class DashboardAccordionLayoutCloudDashboardController {
  @Get()
  public async getById(@Param('uuid') dashboardAccordionUuid: string): Promise<DashboardAccordionLayoutCloudDashboardDto> {
    throw new NotImplementedException();
  }
}
