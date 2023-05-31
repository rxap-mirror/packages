import {
  Component,
  ChangeDetectionStrategy,
  Inject,
  ChangeDetectorRef,
  AfterContentInit
} from '@angular/core';
import { RxapError } from '@rxap/utilities';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { JsonViewerComponent } from '@rxap/components';
import { FlexModule } from '@angular/flex-layout';
import { NgIf } from '@angular/common';

export interface ErrorDialogMatData {
  error: RxapError;
}

@Component({
  selector:        'rxap-error-dialog',
  templateUrl:     './error-dialog.component.html',
  styleUrls:       [ './error-dialog.component.scss' ],
  changeDetection: ChangeDetectionStrategy.Default,
  standalone:      true,
  imports:         [
    MatDialogModule,
    NgIf,
    FlexModule,
    JsonViewerComponent,
    MatButtonModule
  ]
})
export class ErrorDialogComponent implements AfterContentInit {
  public get jsonError() {
    return Object.entries(JSON.parse(JSON.stringify(this.error)))
      .filter(
        ([key, _]) =>
          !['class', 'package', 'code', 'message', 'stack'].includes(key)
      )
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
  }

  public get hasJsonError() {
    return Object.keys(this.jsonError).length > 0;
  }

  public error: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) private readonly data: ErrorDialogMatData,
    @Inject(MatDialogRef)
    public readonly dialogRef: MatDialogRef<any>,
    @Inject(ChangeDetectorRef)
    public cdr: ChangeDetectorRef
  ) {
    this.error = this.data.error.toJSON();
  }

  public ngAfterContentInit(): void {
    this.cdr.detectChanges();
  }
}
