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
  public async get(@Param('uuid') uuid: string): Promise<DashboardAccordionGeneralInformationCloudDashboardDto> {
    const data = await this.dashboardControllerGetByUuidCommand.execute();
    return ToDtoInstance(
    DashboardAccordionGeneralInformationCloudDashboardDto,
    {
      name: data.name,
      company: data.company,
      dashboardType: data.dashboardType
    },
    );
  }

  @Post()
  public async submit(@Body() body: DashboardAccordionGeneralInformationCloudDashboardDto, @Param('uuid') uuid: string): Promise<void> {
    throw new NotImplementedException();
  }
}
