import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DashboardAccordionDataSource } from './dashboard-accordion.data-source';
import { ACCORDION_DATA_SOURCE } from '@rxap/data-source/accordion';
import { CommonModule } from '@angular/common';

import { GeneralInformationPanelComponent } from './general-information-panel/general-information-panel.component';

import { LayoutPanelComponent } from './layout-panel/layout-panel.component';

import { ReferencePanelComponent } from './reference-panel/reference-panel.component';

import { DataSourceDirective } from '@rxap/data-source/directive';
import { NavigateBackButtonComponent } from '@rxap/components';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { PersistentAccordionDirective } from '@rxap/material-directives/expansion';
import { DataSourceErrorComponent } from '@rxap/data-source';
import { AccordionHeaderComponent } from './accordion-header/accordion-header.component';


@Component({
  selector: 'rxap-dashboard-accordion',
  templateUrl: './dashboard-accordion.component.html',
  styleUrls: [ './dashboard-accordion.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    
    GeneralInformationPanelComponent,
    
    LayoutPanelComponent,
    
    ReferencePanelComponent,
    
    DataSourceErrorComponent,
    DataSourceDirective,
    NavigateBackButtonComponent,
    MatProgressBarModule,
    MatDividerModule,
    MatExpansionModule,
    PersistentAccordionDirective,
    CommonModule,
    AccordionHeaderComponent,
  ],
  providers: [
    DashboardAccordionDataSource,
    {
      provide: ACCORDION_DATA_SOURCE,
      useExisting: DashboardAccordionDataSource
    },
  ],
})
export class DashboardAccordionComponent {

  constructor(
    public readonly accordionDataSource: DashboardAccordionDataSource,
  ) {}

}


