import {
  CdkPortalOutlet,
  ComponentPortal,
} from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { SantizationPipe } from '@rxap/pipes/santization';
import { ComponentDialogData } from './types';
import { Showcase } from '@ng-prism/core';

@Showcase({
  title: 'Component Dialog',
  category: 'Dialog',
  description: 'Dialog that renders an arbitrary component as its content, below an optional title. The data is read from `MAT_DIALOG_DATA`, which the styleguide host provides with the http error component as demo content.',
  status: 'stable',
  variants: [
    { name: 'Default' },
  ],
})
@Component({
  selector: 'rxap-component-dialog',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    SantizationPipe,
    MatDialogClose,
    CdkPortalOutlet,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './component-dialog.component.html',
  styleUrl: './component-dialog.component.scss',
})
export class ComponentDialogComponent {

  public readonly data = inject<ComponentDialogData>(MAT_DIALOG_DATA);

  public readonly component = this.data.component;

  public readonly portal = new ComponentPortal(this.component);

  public readonly title = this.data.title;

}
