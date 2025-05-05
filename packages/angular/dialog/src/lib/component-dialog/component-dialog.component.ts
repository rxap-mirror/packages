import {
  CdkPortalOutlet,
  ComponentPortal,
} from '@angular/cdk/portal';
import {
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
  templateUrl: './component-dialog.component.html',
  styleUrl: './component-dialog.component.scss',
})
export class ComponentDialogComponent {

  public readonly data = inject<ComponentDialogData>(MAT_DIALOG_DATA);

  public readonly component = this.data.component;

  public readonly portal = new ComponentPortal(this.component);

  public readonly title = this.data.title;

}
