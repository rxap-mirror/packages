import { HttpModule } from '@nestjs/axios';
import {
  Logger,
  Module,
} from '@nestjs/common';
import { DashboardAccordionGeneralInformationCloudDashboardController } from './dashboard-accordion-general-information-cloud-dashboard.controller';
import { DashboardAccordionGeneralInformationDashboardController } from './dashboard-accordion-general-information-dashboard.controller';
import { DashboardAccordionLayoutCloudDashboardController } from './dashboard-accordion-layout-cloud-dashboard.controller';
import { DashboardAccordionReferenceController } from './dashboard-accordion-reference.controller';
import { DashboardAccordionController } from './dashboard-accordion.controller';

@Module({
  controllers: [DashboardAccordionController, DashboardAccordionGeneralInformationCloudDashboardController, DashboardAccordionGeneralInformationDashboardController, DashboardAccordionLayoutCloudDashboardController, DashboardAccordionReferenceController],
  imports: [HttpModule],
  providers: [Logger],
})
export class DashboardAccordionModule {
}
