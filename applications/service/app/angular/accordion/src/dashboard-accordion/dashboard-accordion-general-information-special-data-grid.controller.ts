import { Controller, Get, NotImplementedException, Post, Body, Param } from '@nestjs/common';
import { DashboardAccordionGeneralInformationSpecialDataGridDto } from './dtos/dashboard-accordion-general-information-special-data-grid.dto';
import { GeneralInformationSpecialDataGridDto } from './dtos/general-information-special-data-grid.dto';

@Controller('dashboard-accordion/:uuid/general-information-special-data-grid')
export class DashboardAccordionGeneralInformationSpecialDataGridController {
  @Get()
  public async get(): Promise<DashboardAccordionGeneralInformationSpecialDataGridDto> {
    throw new NotImplementedException();
  }

  @Post()
  public async submit(@Body() body: GeneralInformationSpecialDataGridDto): Promise<void> {
    throw new NotImplementedException();
  }
}
