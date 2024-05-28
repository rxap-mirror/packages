import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComplexMethod } from './complex.method';

@Component({
  standalone: true,
  selector: 'rxap-complex',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './complex.component.html',
  styleUrls: ['./complex.component.scss'],
  providers: [ComplexMethod],
})
export class ComplexComponent {}
