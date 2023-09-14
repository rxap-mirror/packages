import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';

@Component({
  selector: 'rxap-angular-changelog',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './angular-changelog.component.html',
  styleUrls: [ './angular-changelog.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AngularChangelogComponent {}
