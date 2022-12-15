import {
  NgModule,
  ModuleWithProviders,
  ErrorHandler
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorDialogComponent } from './error-dialog.component';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { ErrorDialogErrorHandler } from './error-dialog.error-handler';
import { JsonViewerModule } from '@rxap/components';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

@NgModule({
  declarations:    [ ErrorDialogComponent ],
  exports:         [ ErrorDialogComponent ],
  imports:         [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    JsonViewerModule,
    FlexLayoutModule
  ]
})
export class ErrorDialogModule {

  public static forRoot(): ModuleWithProviders<ErrorDialogModule> {
    return {
      ngModule:  ErrorDialogModule,
      providers: [
        {
          provide:  ErrorHandler,
          useClass: ErrorDialogErrorHandler
        }
      ]
    };
  }

}
