import { Controller, Get, NotImplementedException, Post, Body, Param } from '@nestjs/common';
import { DashboardAccordionGeneralInformationDashboardDataGridDto } from './dtos/dashboard-accordion-general-information-dashboard-data-grid.dto';
import { GeneralInformationDashboardDataGridDto } from './dtos/general-information-dashboard-data-grid.dto';

@Controller('dashboard-accordion/:uuid/general-information-dashboard-data-grid')
export class DashboardAccordionGeneralInformationDashboardDataGridController {
  @Get()
  public async get(): Promise<DashboardAccordionGeneralInformationDashboardDataGridDto> {
    throw new NotImplementedException();
  }

  @Post()
  public async submit(@Body() body: GeneralInformationDashboardDataGridDto): Promise<void> {
    throw new NotImplementedException();
  }
}
