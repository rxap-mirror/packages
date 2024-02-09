import { Module } from '@nestjs/common';
import { DashboardAccordionController } from './dashboard-accordion.controller';
import { DashboardAccordionGeneralInformationDataGridController } from './dashboard-accordion-general-information-data-grid.controller';
import { DashboardAccordionLayoutController } from './dashboard-accordion-layout.controller';
import { DashboardAccordionReferenceTreeTableController } from './dashboard-accordion-reference-tree-table.controller';

@Module({
  controllers: [DashboardAccordionController, DashboardAccordionGeneralInformationDataGridController, DashboardAccordionLayoutController, DashboardAccordionReferenceTreeTableController],
})
export class DashboardAccordionModule {
}
