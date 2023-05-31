import {
  NgModule,
  ModuleWithProviders
} from '@angular/core';
import { HttpErrorMessageComponent } from './http-error-message.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpErrorMessageInterceptor } from './http-error-message.interceptor';
import { HttpErrorMessageService } from './http-error-message.service';

@NgModule({
  imports: [ HttpErrorMessageComponent ],
  exports: [ HttpErrorMessageComponent ]
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
