import { Module } from '@nestjs/common';
import { DashboardAccordionController } from './dashboard-accordion.controller';
import { DashboardAccordionGeneralInformationSpecialDataGridController } from './dashboard-accordion-general-information-special-data-grid.controller';
import { DashboardAccordionGeneralInformationNormalDataGridController } from './dashboard-accordion-general-information-normal-data-grid.controller';
import { DashboardAccordionLayoutController } from './dashboard-accordion-layout.controller';
import { DashboardAccordionReferenceTreeTableController } from './dashboard-accordion-reference-tree-table.controller';

@Module({
  controllers: [DashboardAccordionController, DashboardAccordionGeneralInformationSpecialDataGridController, DashboardAccordionGeneralInformationNormalDataGridController, DashboardAccordionLayoutController, DashboardAccordionReferenceTreeTableController],
})
export class DashboardAccordionModule {
}
