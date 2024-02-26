import { Module } from '@nestjs/common';
import { DashboardAccordionController } from './dashboard-accordion.controller';
import { DashboardAccordionGeneralInformationCloudDashboardController } from './dashboard-accordion-general-information-cloud-dashboard.controller';
import { DashboardAccordionGeneralInformationDashboardController } from './dashboard-accordion-general-information-dashboard.controller';
import { DashboardAccordionLayoutCloudDashboardController } from './dashboard-accordion-layout-cloud-dashboard.controller';
import { DashboardAccordionReferenceController } from './dashboard-accordion-reference.controller';

@Module({
  controllers: [DashboardAccordionController, DashboardAccordionGeneralInformationCloudDashboardController, DashboardAccordionGeneralInformationDashboardController, DashboardAccordionLayoutCloudDashboardController, DashboardAccordionReferenceController],
  providers: [],
})
export class DashboardAccordionModule {
}
