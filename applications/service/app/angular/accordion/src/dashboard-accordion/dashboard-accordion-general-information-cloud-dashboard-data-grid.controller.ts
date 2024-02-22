import { Controller, Get, NotImplementedException, Post, Body, Param } from '@nestjs/common';
import { DashboardAccordionGeneralInformationCloudDashboardDataGridDto } from './dtos/dashboard-accordion-general-information-cloud-dashboard-data-grid.dto';
import { GeneralInformationCloudDashboardDataGridDto } from './dtos/general-information-cloud-dashboard-data-grid.dto';

@Controller('dashboard-accordion/:uuid/general-information-cloud-dashboard-data-grid')
export class DashboardAccordionGeneralInformationCloudDashboardDataGridController {
  @Get()
  public async get(): Promise<DashboardAccordionGeneralInformationCloudDashboardDataGridDto> {
    throw new NotImplementedException();
  }

  @Post()
  public async submit(@Body() body: GeneralInformationCloudDashboardDataGridDto): Promise<void> {
    throw new NotImplementedException();
  }
}
