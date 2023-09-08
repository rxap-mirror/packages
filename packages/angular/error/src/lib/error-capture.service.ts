import { ComponentType } from '@angular/cdk/overlay';
import {
  ApplicationRef,
  createComponent,
  inject,
  Injectable,
  Injector,
  signal,
  WritableSignal,
} from '@angular/core';
import { take } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  ErrorDialogComponent,
  IErrorDialogComponent,
} from './error-dialog/error-dialog.component';
import {
  RXAP_ERROR_DIALOG_COMPONENT,
  RXAP_ERROR_DIALOG_DATA,
} from './tokens';

@Injectable()
export abstract class ErrorCaptureService<Error = any> {

  protected abstract readonly component: ComponentType<IErrorDialogComponent>;
  private readonly applicationRef = inject(ApplicationRef);
  private errorList: Array<WritableSignal<Error[]>> = [];

  push(error: Error) {
    if (this.errorList.length) {
      const last = this.errorList[this.errorList.length - 1];
      const value = last();
      if (value.some(e => this.compare(e, error))) {
        last.mutate(value => value.push(error));
        return;
      }
    }
    const newList = signal([ error ]);
    this.errorList.push(newList);
    this.openDialog(newList);
  }

  abstract compare(a: Error, b: Error): boolean;

  openDialog(errorList: WritableSignal<Error[]>) {
    const body = document.getElementsByTagName('body')[0];
    const div = document.createElement('div');
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
            useValue: this.component,
          },
        ],
      }),
    });
    this.applicationRef.attachView(componentRef.hostView);
    componentRef.instance.closeDialog.pipe(
      take(1),
      tap(() => {
        componentRef.destroy();
        body.removeChild(div);
        div.remove();
        this.errorList.splice(this.errorList.indexOf(errorList), 1);
      }),
    ).subscribe();
  }

}
