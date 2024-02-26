import { Controller, Get, NotImplementedException, Post, Body, Param } from '@nestjs/common';
import { DashboardAccordionGeneralInformationCloudDashboardDto } from './dtos/dashboard-accordion-general-information-cloud-dashboard.dto';

@Controller('dashboard-accordion/:uuid/general-information-cloud-dashboard')
export class DashboardAccordionGeneralInformationCloudDashboardController {
  @Get()
  public async get(): Promise<DashboardAccordionGeneralInformationCloudDashboardDto> {
    throw new NotImplementedException();
  }

  @Post()
  public async submit(@Body() body: DashboardAccordionGeneralInformationCloudDashboardDto): Promise<void> {
    throw new NotImplementedException();
  }
}
