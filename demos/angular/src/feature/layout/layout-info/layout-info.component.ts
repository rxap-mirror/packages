import { ChangeDetectionStrategy, Component,   inject } from '@angular/core';

import { LayoutService } from '@rxap/layout';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rxap-layout-info',
  imports: [],
  templateUrl: './layout-info.component.html',
  styleUrl: './layout-info.component.scss',
})
export class LayoutInfoComponent {

  readonly layout = inject(LayoutService);

}

export default LayoutInfoComponent;
