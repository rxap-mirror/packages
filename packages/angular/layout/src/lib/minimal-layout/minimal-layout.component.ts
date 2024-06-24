import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BaseLayoutComponent } from '../base-layout/base-layout.component';

@Component({
  selector: 'rxap-minimal-layout',
  standalone: true,
  imports: [ RouterOutlet, BaseLayoutComponent ],
  templateUrl: './minimal-layout.component.html',
  styleUrl: './minimal-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MinimalLayoutComponent {}
