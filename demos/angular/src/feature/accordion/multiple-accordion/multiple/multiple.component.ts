import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MultipleMethod } from './multiple.method';

@Component({
  standalone: true,
  selector: 'rxap-multiple',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './multiple.component.html',
  styleUrls: ['./multiple.component.scss'],
  providers: [MultipleMethod],
})
export class MultipleComponent {}
