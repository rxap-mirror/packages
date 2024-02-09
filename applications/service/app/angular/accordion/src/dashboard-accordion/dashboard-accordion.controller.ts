import { Controller, Get, NotImplementedException, Param } from '@nestjs/common';
import { DashboardAccordionDto } from './dtos/dashboard-accordion.dto';

@Controller('dashboard-accordion')
export class DashboardAccordionController {
  @Get(':uuid')
  public async getById(@Param('uuid') uuid: string): Promise<DashboardAccordionDto> {
    throw new NotImplementedException();
  }
}
