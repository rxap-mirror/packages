import { HttpModule } from '@nestjs/axios';
import {
  Logger,
  Module,
} from '@nestjs/common';
import { CompanyGuiControllerGetByFilterCommand } from 'open-api-legacy/commands/company-gui-controller-get-by-filter.command';
import { CompanyGuiControllerGetByUuidCommand } from 'open-api-legacy/commands/company-gui-controller-get-by-uuid.command';
import { DashboardControllerGetByUuidCommand } from 'open-api-legacy/commands/dashboard-controller-get-by-uuid.command';
import { DashboardAccordionGeneralInformationCloudDashboardController } from './dashboard-accordion-general-information-cloud-dashboard.controller';
import { DashboardAccordionGeneralInformationDashboardController } from './dashboard-accordion-general-information-dashboard.controller';
import { DashboardAccordionLayoutCloudDashboardController } from './dashboard-accordion-layout-cloud-dashboard.controller';
import { DashboardAccordionReferenceController } from './dashboard-accordion-reference.controller';
import { DashboardAccordionController } from './dashboard-accordion.controller';

@Module({
  controllers: [DashboardAccordionController, DashboardAccordionGeneralInformationCloudDashboardController, DashboardAccordionGeneralInformationDashboardController, DashboardAccordionLayoutCloudDashboardController, DashboardAccordionReferenceController],
  imports: [HttpModule],
  providers: [Logger, DashboardControllerGetByUuidCommand, CompanyGuiControllerGetByFilterCommand, CompanyGuiControllerGetByUuidCommand],
})
export class DashboardAccordionModule {
}
