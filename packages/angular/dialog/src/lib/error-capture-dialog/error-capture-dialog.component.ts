import {
  CdkPortalOutlet,
  ComponentPortal,
} from '@angular/cdk/portal';
import {
  NgClass,
  NgForOf,
  NgIf,
} from '@angular/common';
import {
  Component,
  computed,
  inject,
  INJECTOR,
  Injector,
  signal,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { RXAP_ERROR_DIALOG_ERROR } from '@rxap/ngx-error';
import { ErrorCaptureDialogData } from './types';

@Component({
  selector: 'rxap-component-dialog',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatDialogClose,
    CdkPortalOutlet,
    NgForOf,
    NgIf,
    NgClass,
  ],
  templateUrl: './error-capture-dialog.component.html',
  styleUrl: './error-capture-dialog.component.scss',
})
export class ErrorCaptureDialogComponent {

  protected readonly _data = inject<ErrorCaptureDialogData>(MAT_DIALOG_DATA);

  public readonly component = this._data.component;

  public readonly injector = inject(INJECTOR);

  public readonly componentPortal = computed(() => {
    const index = this.activeIndex();
    const data = this.data();
    const injector = Injector.create({
      parent: this.injector,
      providers: [
        {
          provide: RXAP_ERROR_DIALOG_ERROR,
          useValue: data[index],
        },
      ],
    });
    return new ComponentPortal(this.component, null, injector);
  });

  public readonly data = this._data.errorList;

  public readonly activeIndex = signal(0);
  public readonly displayedButtons = computed(() => {
    const start = Math.max(0, this.activeIndex() - 2);
    const end = Math.min(this.data().length, start + 5);
    return Array.from({ length: end - start }, (_, i) => start + i);
  });

}
