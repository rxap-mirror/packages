import { ComponentRef, EmbeddedViewRef, Injector } from '@angular/core';
import { TemplatePortal } from '@angular/cdk/portal';
import { WindowRef } from './window-ref';
import { RXAP_WINDOW_SETTINGS } from './tokens';

describe('WindowRef', () => {
  let host: HTMLElement;
  let config: any;
  let overlayRef: any;
  let overlay: any;
  let positionStrategy: any;
  let ref: WindowRef;

  beforeEach(() => {
    vi.useFakeTimers();
    host = document.createElement('div');
    config = { width: '300px', height: '200px', minWidth: '10px', minHeight: '20px', maxWidth: '1000px', maxHeight: '900px' };
    overlayRef = {
      hostElement: host,
      overlayElement: document.createElement('div'),
      dispose: vi.fn(),
      getConfig: vi.fn(() => config),
      updateSize: vi.fn((c: any) => Object.assign(config, c)),
      updatePositionStrategy: vi.fn(),
      updatePosition: vi.fn(),
    };
    positionStrategy = {
      top: vi.fn(() => positionStrategy),
      left: vi.fn(() => positionStrategy),
    };
    overlay = { position: () => ({ global: () => positionStrategy }) };
    ref = new WindowRef(overlayRef, overlay, { id: 'x', minimizable: true, draggable: false, title: 'T' });
  });

  afterEach(() => vi.useRealTimers());

  it('exposes settings', () => {
    expect(ref.id).toBe('x');
    expect(ref.minimizable).toBe(true);
    expect(ref.draggable).toBe(false);
    expect(ref.minWidth).toBeUndefined();
    expect(ref.minHeight).toBeUndefined();
    expect(ref.maxWidth).toBeUndefined();
    expect(ref.maxHeight).toBeUndefined();
    expect(ref.width$.value).toBe('300px');
    expect(ref.height$.value).toBe('200px');
  });

  it('close() emits the result, notifies closed$ and completes', () => {
    const next = vi.fn();
    const complete = vi.fn();
    const closed = vi.fn();
    ref.subscribe({ next, complete });
    ref.closed$.subscribe(closed);
    ref.close('r');
    expect(next).toHaveBeenCalledWith('r');
    expect(closed).toHaveBeenCalledWith('r');
    expect(overlayRef.dispose).toHaveBeenCalled();
    expect(complete).toHaveBeenCalled();
  });

  it('close() without result does not emit a value', () => {
    const next = vi.fn();
    ref.subscribe(next);
    ref.close();
    expect(next).not.toHaveBeenCalled();
  });

  it('minimize and reopen toggle display', () => {
    ref.minimize();
    expect(ref.isMinimized).toBe(true);
    ref.reopen();
    expect(host.style.display).toBe('flex');
    expect(ref.isMinimized).toBe(false);
    expect(positionStrategy.top).toHaveBeenCalledWith('16px');
    expect(overlayRef.updatePosition).toHaveBeenCalled();
  });

  it('sets width and height', () => {
    ref.setWidth('500px');
    ref.setHeight('400px');
    expect(ref.width$.value).toBe('500px');
    expect(ref.height$.value).toBe('400px');
    expect(ref.getWidth()).toBe('500px');
    expect(ref.getHeight()).toBe('400px');
    expect(ref.getSizeConfig().minWidth).toBe('10px');
  });

  it('getPos reads the bounding rect', () => {
    expect(ref.getPos()).toEqual({ x: '0px', y: '0px' });
  });

  it('toggles full screen and restores the old sizes', () => {
    ref.fullScreen();
    expect(config.width).toBe('100vw');
    expect(config.height).toBe('100vh');
    expect(positionStrategy.top).toHaveBeenLastCalledWith('0px');
    ref.fullScreen();
    expect(config.width).toBe('0px');
    expect(config.height).toBe('0px');
    ref.fullScreen();
    expect(config.width).toBe('100vw');
  });

  it('publishes portals asynchronously', () => {
    const footer = vi.fn();
    const title = vi.fn();
    ref.footerPortal$.subscribe(footer);
    ref.titlePortal$.subscribe(title);
    const portal = {} as TemplatePortal;
    ref.setFooterPortal(portal);
    ref.setTitlePortal(portal);
    expect(footer).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(footer).toHaveBeenCalledWith(portal);
    expect(title).toHaveBeenCalledWith(portal);
  });

  it('merges the settings of the attached component ref', () => {
    const settings = vi.fn();
    ref.settings$.subscribe(settings);
    const attached = vi.fn();
    ref.attachedRef$.subscribe(attached);
    const injector = Injector.create({ providers: [{ provide: RXAP_WINDOW_SETTINGS, useValue: { title: 'C', icon: { icon: 'a' } } }] });
    const cmpRef = Object.create(ComponentRef.prototype);
    Object.defineProperty(cmpRef, 'injector', { value: injector });
    ref.setAttachedRef(cmpRef);
    vi.runAllTimers();
    expect(attached).toHaveBeenCalledWith(cmpRef);
    expect(settings).toHaveBeenCalledWith(expect.objectContaining({ id: 'x', title: 'C' }));
  });

  it('falls back to the own settings for embedded views and components without settings', () => {
    const settings = vi.fn();
    ref.settings$.subscribe(settings);
    ref.setAttachedRef({} as EmbeddedViewRef<any>);
    vi.runAllTimers();
    expect(settings).toHaveBeenCalledWith(expect.objectContaining({ title: 'T' }));
    const cmpRef = Object.create(ComponentRef.prototype);
    Object.defineProperty(cmpRef, 'injector', { value: Injector.create({ providers: [] }) });
    ref.setAttachedRef(cmpRef);
    vi.runAllTimers();
    expect(settings).toHaveBeenCalledTimes(2);
  });
});
