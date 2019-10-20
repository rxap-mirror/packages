import {
  Injectable,
  Injector
} from '@angular/core';
import {
  Actions,
  Effect,
  ofType
} from '@ngrx/effects';
import {
  OpenWindow,
  CloseWindow,
  MinimizeWindow,
  ReopenWindow,
  SetWindowWidth,
  SetWindowHeight,
  SetWindowPosition,
  WindowOpened
} from './window.actions';
import { WindowService } from './window.service';
import {
  tap,
  map,
  filter
} from 'rxjs/operators';
import { DefaultWindowComponent } from './default-window/default-window.component';
import { v1 as uuid } from 'uuid';

@Injectable()
export class WindowEffects {

  @Effect({ dispatch: true, resubscribeOnError: true })
  public openWindow$ = this.actions$.pipe(
    ofType<OpenWindow<any, any>>(OpenWindow.TYPE),
    filter(action => !this.window.has(action.config.id)),
    map(action => {

      const id = action.config.id || uuid();

      if (action.config.component) {
        throw new Error();
      }

      this.window.open({
        id,
        ...action.config,
        component: DefaultWindowComponent
      });

      return new WindowOpened(action.config, id, action.tracer);

    })
  );

  @Effect({ dispatch: false, resubscribeOnError: true })
  public closeWindow$ = this.actions$.pipe(
    ofType<CloseWindow>(CloseWindow.TYPE),
    tap(action => this.window.close(action.windowId))
  );

  @Effect({ dispatch: false, resubscribeOnError: true })
  public minimize$ = this.actions$.pipe(
    ofType<MinimizeWindow>(MinimizeWindow.TYPE),
    tap(action => this.window.get(action.windowId).minimize())
  );

  @Effect({ dispatch: false, resubscribeOnError: true })
  public reopen$ = this.actions$.pipe(
    ofType<ReopenWindow>(ReopenWindow.TYPE),
    tap(action => this.window.get(action.windowId).reopen())
  );

  @Effect({ dispatch: false, resubscribeOnError: true })
  public setWidth$ = this.actions$.pipe(
    ofType<SetWindowWidth>(SetWindowWidth.TYPE),
    tap(action => this.window.get(action.windowId).setWidth(action.width))
  );

  @Effect({ dispatch: false, resubscribeOnError: true })
  public setHeight$ = this.actions$.pipe(
    ofType<SetWindowHeight>(SetWindowHeight.TYPE),
    tap(action => this.window.get(action.windowId).setHeight(action.height))
  );

  @Effect({ dispatch: false, resubscribeOnError: true })
  public setPos$ = this.actions$.pipe(
    ofType<SetWindowPosition>(SetWindowPosition.TYPE),
    tap(action => this.window.get(action.windowId).setPos(action.x, action.y))
  );


  constructor(
    public actions$: Actions,
    public window: WindowService,
    public injector: Injector
  ) {}

}
