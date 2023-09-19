import {
  ApplicationRef,
  createComponent,
  Inject,
  Injectable,
  Injector,
} from '@angular/core';
import {
  SwUpdate,
  UpdateAvailableEvent,
} from '@angular/service-worker';
import { ErrorDialogComponent } from '@rxap/ngx-error';
import { Observable } from 'rxjs';
import {
  concatMap,
  tap,
} from 'rxjs/operators';
import { UPDATE_AVAILABLE_EVENT } from './service-worker-update-dialog/service-worker-update-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class DialogUpdateService {
  constructor(
    @Inject(ApplicationRef)
    private readonly applicationRef: ApplicationRef,
    @Inject(SwUpdate)
    private readonly updates: SwUpdate,
  ) {
  }

  public start(): void {
    console.debug('start dialog update service');
    this.updates.available
        .pipe(
          concatMap((event) => this.openSnackBar(event)),
          tap(() => console.log('start app update')),
          tap(() =>
            this.updates.activateUpdate().then(() => {
              console.log('app update completed. Reload app.');
              document.location.reload();
            }),
          ),
        )
        .subscribe();
  }

  private openSnackBar(event: UpdateAvailableEvent): Observable<void> {
    const body = document.getElementsByTagName('body')[0];
    const div = document.createElement('div');
    body.appendChild(div);
    const componentRef = createComponent(ErrorDialogComponent, {
      hostElement: div,
      environmentInjector: this.applicationRef.injector,
      elementInjector: Injector.create({
        providers: [
          {
            provide: UPDATE_AVAILABLE_EVENT,
            useValue: event,
          },
        ],
      }),
    });
    this.applicationRef.attachView(componentRef.hostView);

    return componentRef.instance.closeDialog.pipe(
      tap(() => {
        componentRef.destroy();
        body.removeChild(div);
        div.remove();
      }),
    );
  }
}
