import {
  Injectable,
  Inject
} from '@angular/core';
import {
  BaseDefinition,
  GetDefinitionClassName,
  GetDefinitionPackageName
} from '@rxap/definition';
import {
  Subject,
  Subscription,
  throwError
} from 'rxjs';
import {
  mergeMap,
  takeUntil,
  tap,
  finalize,
  switchMap,
  map,
  filter,
  timeout,
  catchError
} from 'rxjs/operators';
import { ChildTab } from '@rxap/across-tabs';
import { Interception } from './interception';
import { RXAP_RECORDER_ACTIVE } from './tokens';

@Injectable({ providedIn: 'root' })
export class RecorderService {

  private _subscription?: Subscription;

  private child!: ChildTab;

  constructor(@Inject(RXAP_RECORDER_ACTIVE) private readonly active: boolean) {}

  public init(): Promise<void> {

    if (!this.active) {
      return Promise.resolve();
    }

    console.debug('init recorder service');

    this.child = new ChildTab();

    return new Promise<void>((resolve, reject) => {

      this._subscription = this.child.onInitialize$.pipe(
        tap(() => console.debug('child is ready')),
        map(() => this.child.getTabInfo()),
        tap(info => console.debug('tab info', info)),
        filter(info => !!info.id),
        tap(() => resolve()),
        timeout(5000),
        catchError(error => {
          reject(error);
          return throwError(error);
        }),
        switchMap(info => BaseDefinition.initialised$.pipe(
          mergeMap(definition => {
            const interceptor$ = new Subject<any>();
            definition.interceptors.add(interceptor$);

            const interception: Interception = {
              definitionId: definition.id,
              instanceId:   definition.__id,
              childTabId:   info.id,
              packageName:  this.getDefinitionPackageName(definition),
              className:    this.getDefinitionName(definition),
              timestamp:    Date.now()
            };

            console.debug('interception:', interception);

            return interceptor$.pipe(
              takeUntil(definition.destroyed$),
              tap(data => this.child.sendMessageToParent(JSON.stringify({
                ...interception,
                data
              }))),
              finalize(() => this.child.sendMessageToParent(JSON.stringify({
                ...interception,
                destroyed: true
              })))
            );

          })
        ))
      ).subscribe();

    });

  }

  public getDefinitionName(definition: BaseDefinition): string {
    const name = GetDefinitionClassName(definition);

    if (!name) {
      throw new Error('Could not extract definition name');
    }

    return name;
  }

  public getDefinitionPackageName(definition: BaseDefinition): string {
    const name = GetDefinitionPackageName(definition);

    if (!name) {
      throw new Error('Could not extract definition package name');
    }

    return name;
  }

}
