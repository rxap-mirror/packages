import {
  Body,
  Controller,
  Get,
  NotImplementedException,
  Param,
  Post,
} from '@nestjs/common';
import { ToDtoInstance } from '@rxap/nest-dto';
import { DashboardAccordionGeneralInformationCloudDashboardDto } from './dtos/dashboard-accordion-general-information-cloud-dashboard.dto';

@Controller('dashboard-accordion/:uuid/general-information-cloud-dashboard')
export class DashboardAccordionGeneralInformationCloudDashboardController {
  private readonly dashboardControllerGetByUuidCommand?: any;

  @Get()
  public async getById(@Param('uuid') uuid: string): Promise<DashboardAccordionGeneralInformationCloudDashboardDto> {
    const data = await this.dashboardControllerGetByUuidCommand.execute({ parameters: { uuid } });
    return ToDtoInstance(
    DashboardAccordionGeneralInformationCloudDashboardDto,
    {
      uuid: uuid,
      name: data.name!,
      company: data.company?.uuid,
      dashboardType: data.dashboardType!
    },
    );
  }

  @Post()
  public async submitById(@Body() body: DashboardAccordionGeneralInformationCloudDashboardDto, @Param('uuid') uuid: string): Promise<void> {
    throw new NotImplementedException();
  }
}
