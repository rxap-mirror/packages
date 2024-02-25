import { Module } from '@nestjs/common';
import { DashboardAccordionController } from './dashboard-accordion.controller';
import { DashboardAccordionGeneralInformationCloudDashboardDataGridController } from './dashboard-accordion-general-information-cloud-dashboard-data-grid.controller';
import { DashboardAccordionGeneralInformationDashboardController } from './dashboard-accordion-general-information-dashboard.controller';
import { DashboardAccordionGeneralInformationDashboardDataGridController } from './dashboard-accordion-general-information-dashboard-data-grid.controller';
import { DashboardAccordionLayoutCloudDashboardController } from './dashboard-accordion-layout-cloud-dashboard.controller';
import { DashboardAccordionReferenceTreeTableController } from './dashboard-accordion-reference-tree-table.controller';

@Module({
  controllers: [DashboardAccordionController, DashboardAccordionGeneralInformationCloudDashboardDataGridController, DashboardAccordionGeneralInformationDashboardController, DashboardAccordionGeneralInformationDashboardDataGridController, DashboardAccordionLayoutCloudDashboardController, DashboardAccordionReferenceTreeTableController],
})
export class DashboardAccordionModule {
}
