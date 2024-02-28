import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { ToDtoInstance } from '@rxap/nest-dto';
import { DashboardAccordionDto } from './dtos/dashboard-accordion.dto';

@Controller('dashboard-accordion')
export class DashboardAccordionController {
  private readonly dashboardControllerGetByUuidCommand?: any;

  @Get(':uuid')
  public async getById(@Param('uuid') uuid: string): Promise<DashboardAccordionDto> {
    const data = await this.dashboardControllerGetByUuidCommand.execute({ parameters: { uuid } });
    return ToDtoInstance(
    DashboardAccordionDto,
    {
      uuid: uuid,
      dashboardType: data.dashboardType,
      name: data.name
    },
    );
  }
}
