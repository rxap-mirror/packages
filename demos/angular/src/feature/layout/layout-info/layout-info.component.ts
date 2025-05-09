import {
  Component,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutService } from '@rxap/layout';

@Component({
  selector: 'rxap-layout-info',
  imports: [CommonModule],
  templateUrl: './layout-info.component.html',
  styleUrl: './layout-info.component.scss',
})
export class LayoutInfoComponent {

  readonly layout = inject(LayoutService);

}

export default LayoutInfoComponent;
