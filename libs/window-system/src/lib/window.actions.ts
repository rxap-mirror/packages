import { Action } from '@ngrx/store';
import { WindowConfig } from './window-config';
import { v1 as uuid } from 'uuid';

export class WindowOpened<D, T> implements Action {
  public static TYPE   = 'rxap/core/window/WINDOW_OPENED';
  public readonly type = WindowOpened.TYPE;

  constructor(public config: WindowConfig<D, T>, public windowId: string = config.id || uuid(), public tracer?: string) {}
}

export class SetWindowPosition implements Action {
  public static TYPE   = 'rxap/core/window/SET_WINDOW_POSITION';
  public readonly type = SetWindowPosition.TYPE;

  constructor(public windowId: string, public x: string, public y: string, public tracer?: string) {}
}

export class OpenWindow<D, T> implements Action {
  public static TYPE   = 'rxap/core/window/OPEN_WINDOW';
  public readonly type = OpenWindow.TYPE;

  constructor(public config: WindowConfig<D, T>, public tracer?: string) {}
}

export class SetWindowWidth implements Action {
  public static TYPE   = 'rxap/core/window/SET_WINDOW_WIDTH';
  public readonly type = SetWindowWidth.TYPE;

  constructor(public windowId: string, public width: string, public tracer?: string) {}

}

export class SetWindowHeight implements Action {
  public static TYPE   = 'rxap/core/window/SET_WINDOW_HEIGHT';
  public readonly type = SetWindowHeight.TYPE;

  constructor(public windowId: string, public height: string, public tracer?: string) {}

}

export class MinimizeWindow implements Action {
  public static TYPE   = 'rxap/core/window/MINIMIZE_WINDOW';
  public readonly type = MinimizeWindow.TYPE;

  constructor(public windowId: string, public tracer?: string) {}

}

export class CloseWindow implements Action {
  public static TYPE   = 'rxap/core/window/CLOSE_WINDOW';
  public readonly type = CloseWindow.TYPE;

  constructor(public windowId: string, public tracer?: string) {}

}

export class ReopenWindow implements Action {
  public static TYPE   = 'rxap/core/window/REOPEN_WINDOW';
  public readonly type = ReopenWindow.TYPE;

  constructor(public windowId: string, public tracer?: string) {}

}

export class FullScreenWindow implements Action {
  public static TYPE   = 'rxap/core/window/FULL_SCREEN_WINDOW';
  public readonly type = FullScreenWindow.TYPE;

  constructor(public windowId: string, public tracer?: string) {}

}

export class SetWindowTitle implements Action {
  public static TYPE   = 'rxap/core/window/SET_WINDOW_TITLE';
  public readonly type = SetWindowTitle.TYPE;

  constructor(public windowId: string, public title: string, public tracer?: string) {}

}

export class SetWindowIcon implements Action {
  public static TYPE   = 'rxap/core/window/SET_WINDOW_ICON';
  public readonly type = SetWindowIcon.TYPE;

  constructor(public windowId: string, public icon: string, public tracer?: string) {}

}
