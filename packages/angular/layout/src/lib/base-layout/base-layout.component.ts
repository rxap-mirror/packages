import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import {
  FooterComponent,
  HeaderComponent,
} from '@rxap/layout';
import { StatusIndicatorComponent } from '@rxap/ngx-status-check';

@Component({
  selector: 'rxap-base-layout',
  standalone: true,
  imports: [
    StatusIndicatorComponent,
    HeaderComponent,
    FooterComponent,

  ],
  templateUrl: './base-layout.component.html',
  styleUrl: './base-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseLayoutComponent {}
