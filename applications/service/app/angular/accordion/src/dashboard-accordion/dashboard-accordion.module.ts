import { Module, Logger } from '@nestjs/common';
import { DashboardAccordionController } from './dashboard-accordion.controller';
import { DashboardAccordionGeneralInformationCloudDashboardController } from './dashboard-accordion-general-information-cloud-dashboard.controller';
import { DashboardAccordionGeneralInformationDashboardController } from './dashboard-accordion-general-information-dashboard.controller';
import { DashboardAccordionLayoutCloudDashboardController } from './dashboard-accordion-layout-cloud-dashboard.controller';
import { DashboardAccordionReferenceController } from './dashboard-accordion-reference.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [DashboardAccordionController, DashboardAccordionGeneralInformationCloudDashboardController, DashboardAccordionGeneralInformationDashboardController, DashboardAccordionLayoutCloudDashboardController, DashboardAccordionReferenceController],
  providers: [Logger],
  imports: [HttpModule],
})
export class DashboardAccordionModule {
}
