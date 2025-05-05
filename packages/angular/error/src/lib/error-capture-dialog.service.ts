import { ComponentType } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import {
  ApplicationRef,
  createComponent,
  inject,
  Injectable,
  Injector,
  WritableSignal,
} from '@angular/core';
import {
  finalize,
  Observable,
  take,
} from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  ErrorDialogComponent,
  IErrorDialogComponent,
} from './error-dialog/error-dialog.component';
import {
  RXAP_ERROR_DIALOG_COMPONENT,
  RXAP_ERROR_DIALOG_DATA,
} from './tokens';

export interface IErrorCaptureDialogService<Error = any> {
  open(component: ComponentType<IErrorDialogComponent>, errorList: WritableSignal<Error[]>): Observable<void>;
}

@Injectable({ providedIn: 'root' })
export class ErrorCaptureDialogService<Error = any> implements IErrorCaptureDialogService<Error> {

  protected readonly applicationRef = inject(ApplicationRef);
  protected readonly document = inject(DOCUMENT);

  open(component: ComponentType<IErrorDialogComponent>, errorList: WritableSignal<Error[]>): Observable<void> {
    const body = this.document.getElementsByTagName('body')[0];
    const div = this.document.createElement('div');
    body.appendChild(div);
    const componentRef = createComponent(ErrorDialogComponent, {
      hostElement: div,
      environmentInjector: this.applicationRef.injector,
      elementInjector: Injector.create({
        providers: [
          {
            provide: RXAP_ERROR_DIALOG_DATA,
            useValue: errorList,
          },
          {
            provide: RXAP_ERROR_DIALOG_COMPONENT,
            useValue: component,
          },
        ],
      }),
    });
    this.applicationRef.attachView(componentRef.hostView);
    return new Observable<void>(subscriber => {
      const subscription = componentRef.instance.closeDialog.pipe(
        take(1),
        tap(() => {
          subscriber.next();
          subscriber.complete();
        }),
        finalize(() => {
          componentRef.destroy();
          body.removeChild(div);
          div.remove();
        })
      ).subscribe();
      return () => {
        subscription.unsubscribe();
      };
    });

  }

}
