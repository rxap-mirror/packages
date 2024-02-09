import { Controller, Get, NotImplementedException, Post, Body, Param } from '@nestjs/common';
import { DashboardAccordionGeneralInformationDataGridDto } from './dtos/dashboard-accordion-general-information-data-grid.dto';
import { GeneralInformationDataGridDto } from './dtos/general-information-data-grid.dto';

@Controller('dashboard-accordion/:uuid/general-information-data-grid')
export class DashboardAccordionGeneralInformationDataGridController {
  @Get()
  public async get(): Promise<DashboardAccordionGeneralInformationDataGridDto> {
    throw new NotImplementedException();
  }

  @Post()
  public async submit(@Body() body: GeneralInformationDataGridDto): Promise<void> {
    throw new NotImplementedException();
  }
}
