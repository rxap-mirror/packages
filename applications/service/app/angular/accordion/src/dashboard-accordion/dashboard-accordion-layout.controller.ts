import { Controller, Get, NotImplementedException, Param } from '@nestjs/common';
import { DashboardAccordionLayoutDto } from './dtos/dashboard-accordion-layout.dto';

@Controller('dashboard-accordion/:uuid/layout')
export class DashboardAccordionLayoutController {
  @Get()
  public async getById(@Param('uuid') dashboardAccordionUuid: string): Promise<DashboardAccordionLayoutDto> {
    throw new NotImplementedException();
  }
}
