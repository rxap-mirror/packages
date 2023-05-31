import {
  NgModule,
  ModuleWithProviders,
  ErrorHandler
} from '@angular/core';
import { ErrorDialogComponent } from './error-dialog.component';
import { ErrorDialogErrorHandler } from './error-dialog.error-handler';

@NgModule({
  exports: [ ErrorDialogComponent ],
  imports: [ ErrorDialogComponent ]
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
