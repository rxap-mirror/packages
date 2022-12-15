import {
  NgModule,
  ModuleWithProviders
} from '@angular/core';
import { HttpErrorMessageComponent } from './http-error-message.component';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpErrorMessageInterceptor } from './http-error-message.interceptor';
import { HttpErrorMessageService } from './http-error-message.service';
import { DataGridReadonlyComponentModule } from '@rxap/data-grid';
import {
  JsonViewerModule,
  CopyToClipboardModule
} from '@rxap/components';

@NgModule({
  declarations: [ HttpErrorMessageComponent ],
  imports:      [
    MatDialogModule,
    MatButtonModule,
    DataGridReadonlyComponentModule,
    CommonModule,
    JsonViewerModule,
    CopyToClipboardModule
  ],
  exports:      [ HttpErrorMessageComponent, MatDialogModule ]
})
export class HttpErrorMessageModule {
  public static forRoot(): ModuleWithProviders<HttpErrorMessageModule> {
    return {
      ngModule:  HttpErrorMessageModule,
      providers: [
        HttpErrorMessageService,
        {
          provide:  HTTP_INTERCEPTORS,
          useClass: HttpErrorMessageInterceptor,
          multi:    true
        }
      ]
    };
  }
}
