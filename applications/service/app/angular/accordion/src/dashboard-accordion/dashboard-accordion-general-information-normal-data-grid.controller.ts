import { Controller, Get, NotImplementedException, Param } from '@nestjs/common';
import { DashboardAccordionGeneralInformationNormalDataGridDto } from './dtos/dashboard-accordion-general-information-normal-data-grid.dto';

@Controller('dashboard-accordion/:uuid/general-information-normal-data-grid')
export class DashboardAccordionGeneralInformationNormalDataGridController {
  @Get()
  public async get(): Promise<DashboardAccordionGeneralInformationNormalDataGridDto> {
    throw new NotImplementedException();
  }
}
