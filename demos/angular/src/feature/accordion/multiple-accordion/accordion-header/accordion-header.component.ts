import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { NavigateBackButtonComponent } from '@rxap/components';
import { MultipleAccordion } from '../multiple-accordion';

@Component({
  selector: 'rxap-accordion-header',
  templateUrl: './accordion-header.component.html',
  styleUrls: [ './accordion-header.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NavigateBackButtonComponent,
  ],
})
export class AccordionHeaderComponent {
  @Input({
    required: true,
  })
  public data!: MultipleAccordion;
}
