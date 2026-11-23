import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, Injectable } from '@angular/core';
import { WindowSettings } from '../src/lib/window-config';
import { WindowRef } from '../src/lib/window-ref';
import { WindowService } from '../src/lib/window.service';

/**
 * Content of the demo windows of the styleguide.
 */
@Component({
  selector: 'rxap-window-demo-content',
  template: `
    <h3>Quarterly report</h3>
    <p>This is the content of a window. It is rendered by the window content component.</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WindowDemoContentComponent {}

export const WINDOW_DEMO_SETTINGS: WindowSettings = {
  id: 'prism-window',
  title: 'Quarterly report',
  icon: 'description',
  width: '480px',
  height: '320px',
  minWidth: '320px',
  minHeight: '200px',
  maxWidth: '100vw',
  maxHeight: '100vh',
  resizeable: true,
  draggable: true,
  minimizable: true,
};

/**
 * A window ref that is not attached to a cdk overlay: the styleguide renders the window components inside its canvas
 * and not in an overlay.
 */
export function createDemoWindowRef(settings: WindowSettings): { windowRef: WindowRef, overlayRef: OverlayRef } {
  const host = document.createElement('div');
  const overlayRef = {
    hostElement: host,
    overlayElement: host,
    getConfig: () => ({
      width: settings.width,
      height: settings.height,
      minWidth: settings.minWidth,
      minHeight: settings.minHeight,
      maxWidth: settings.maxWidth,
      maxHeight: settings.maxHeight,
    }),
    updateSize: () => undefined,
    updatePosition: () => undefined,
    updatePositionStrategy: () => undefined,
    dispose: () => undefined,
  } as unknown as OverlayRef;
  const overlay = {
    position: () => ({ global: () => ({ top: () => ({ left: () => ({}) }) }) }),
  } as unknown as Overlay;
  const windowRef = new WindowRef(overlayRef, overlay, settings);
  windowRef.settings$.next(settings);
  return { windowRef, overlayRef };
}

const ACTIVE_WINDOWS = [
  createDemoWindowRef({ ...WINDOW_DEMO_SETTINGS, id: 'prism-window-report' }).windowRef,
  createDemoWindowRef({ ...WINDOW_DEMO_SETTINGS, id: 'prism-window-customers', title: 'Customer list', icon: 'group' }).windowRef,
];
// the second window is minimized
ACTIVE_WINDOWS[1].minimize();

/**
 * The window service of the styleguide reports two open windows, so that the task bar components have a task to
 * render. Opening a window still works as in the real service.
 */
@Injectable()
export class DemoWindowService extends WindowService {

  public override get hasActiveWindows(): boolean {
    return true;
  }

  public override get activeWindowCount(): number {
    return ACTIVE_WINDOWS.length;
  }

  public override get allActiveWindows(): Array<WindowRef<any>> {
    return ACTIVE_WINDOWS;
  }

}
