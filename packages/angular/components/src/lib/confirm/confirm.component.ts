import {
  ChangeDetectionStrategy,
  Component,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Showcase } from '@ng-prism/core';

@Showcase<ConfirmComponent>({
  title: 'Confirm',
  category: 'Components',
  description: 'Small overlay with an accept and a decline icon button. It is opened by the `rxapConfirm` directive and emits `confirmed` or `unconfirmed`.',
  status: 'stable',
  variants: [
    { name: 'Default', description: 'Accept and decline button next to each other.' },
  ],
  states: [
    { name: 'Hover', pseudo: { hover: 'button' } },
    { name: 'Focus visible', pseudo: { 'focus-visible': 'button' } },
  ],
})
@Component({
    selector: 'rxap-confirm',
    templateUrl: './confirm.component.html',
    styleUrls: ['./confirm.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatButtonModule, MatIconModule]
})
export class ConfirmComponent {

  public readonly confirmed = output<void>();

  public readonly unconfirmed = output<void>();

}
