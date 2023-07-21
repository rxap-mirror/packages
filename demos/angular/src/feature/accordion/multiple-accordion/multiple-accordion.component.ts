import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { MultipleAccordionDataSource } from './multiple-accordion.data-source';
import { ACCORDION_DATA_SOURCE } from '@rxap/data-source/accordion';
import { CommonModule } from '@angular/common';

import { FirstPanelComponent } from './first-panel/first-panel.component';

import { SecondPanelComponent } from './second-panel/second-panel.component';

import { ThirdPanelComponent } from './third-panel/third-panel.component';

import { DataSourceDirective } from '@rxap/data-source/directive';
import { NavigateBackButtonComponent } from '@rxap/components';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { PersistentAccordionDirective } from '@rxap/material-directives/expansion';
import { DataSourceErrorComponent } from '@rxap/data-source';
import { AccordionHeaderComponent } from './accordion-header/accordion-header.component';
import { MultipleAccordionMethod } from './multiple-accordion.method';

@Component({
  selector: 'rxap-multiple-accordion',
  templateUrl: './multiple-accordion.component.html',
  styleUrls: [ './multiple-accordion.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [

    FirstPanelComponent,

    SecondPanelComponent,

    ThirdPanelComponent,

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
    MultipleAccordionDataSource,
    {
      provide: ACCORDION_DATA_SOURCE,
      useExisting: MultipleAccordionDataSource,
    },
    MultipleAccordionMethod,
  ],
})
export class MultipleAccordionComponent {

  constructor(
    public readonly accordionDataSource: MultipleAccordionDataSource,
  ) {}

}

export default MultipleAccordionComponent;
