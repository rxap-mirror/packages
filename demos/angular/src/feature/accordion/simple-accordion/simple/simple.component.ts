import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SimpleMethod } from './simple.method';

@Component({
  standalone: true,
  selector: 'rxap-simple',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './simple.component.html',
  styleUrls: ['./simple.component.scss'],
  providers: [SimpleMethod],
})
export class SimpleComponent {}
