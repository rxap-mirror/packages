import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { NavigateBackButtonComponent } from '@rxap/components';
import { ComplexAccordion } from '../complex-accordion';

@Component({
    selector: 'rxap-accordion-header',
    templateUrl: './accordion-header.component.html',
    styleUrls: ['./accordion-header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NavigateBackButtonComponent,
    ]
})
export class AccordionHeaderComponent {
  public readonly data = input.required<ComplexAccordion>();
}
