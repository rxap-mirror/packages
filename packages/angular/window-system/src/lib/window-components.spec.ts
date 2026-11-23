import { ChangeDetectionStrategy, Component, ComponentRef, TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, config } from 'rxjs';
import { WindowContainerComponent } from './window-container/window-container.component';
import { WindowResizerComponent } from './window-resizer/window-resizer.component';
import { WindowFooterDirective } from './window-footer.directive';
import { WindowTitleDirective } from './window-title.directive';
import { WindowService } from './window.service';

@Component({
  standalone: true,
  selector: 'rxap-test-plain-content',
  template: `<span class="plain-content">content</span>`,
})
class PlainContentComponent {}

@Component({
  standalone: true,
  selector: 'rxap-test-loading-content',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<span class="loaded">{{ text }}</span>`,
})
class LoadingContentComponent {
  readonly loading$ = new BehaviorSubject<boolean>(true);
  text = 'initial';
}

@Component({
  standalone: true,
  template: `<ng-template #plain><b class="tpl">template</b></ng-template>`,
})
class HostComponent {
  plain = viewChild.required<TemplateRef<any>>('plain');
}

describe('window components', () => {
  let service: WindowService;
  let host: ComponentFixture<HostComponent>;

  const q = (selector: string) => document.querySelector(selector) as HTMLElement | null;

  const setup = () => {
    TestBed.configureTestingModule({
      imports: [HostComponent, MatIconTestingModule, NoopAnimationsModule],
    });
    service = TestBed.inject(WindowService);
    host = TestBed.createComponent(HostComponent);
    host.detectChanges();
  };

  const flush = async () => {
    host.detectChanges();
    await host.whenStable();
    await new Promise((r) => setTimeout(r, 5));
    host.detectChanges();
    await host.whenStable();
  };

  /**
   * Resolves the component instance rendered for the given element through the dev mode debug api.
   */
  const getComponent = <T>(element: Element): T => (globalThis as any).ng.getComponent(element) as T;

  afterEach(() => {
    service?.allActiveWindows.forEach((w) => w.complete());
    document.body.innerHTML = '';
    vi.useRealTimers();
  });

  describe('WindowContainerComponent', () => {

    let container: WindowContainerComponent;

    const openContainer = async (settings: Record<string, unknown> = {}) => {
      setup();
      const ref = service.open({ id: 'c', component: PlainContentComponent, ...settings });
      await flush();
      container = getComponent<WindowContainerComponent>(q('rxap-default-window rxap-window-container')!
        ?? q('.rxap-window-container')!);
      return ref;
    };

    it('starts with the full size of the overlay', async () => {
      await openContainer();
      expect(container).toBeInstanceOf(WindowContainerComponent);
      expect(container.width()).toBe('100%');
      expect(container.height()).toBe('100%');
    });

    it('applies the size of the window ref when it is defined in pixels', async () => {
      const ref = await openContainer();
      ref.setWidth('640px');
      ref.setHeight('480px');
      expect(container.width()).toBe('640px');
      expect(container.height()).toBe('480px');
    });

    it('ignores sizes that do not start with a number', async () => {
      const ref = await openContainer();
      ref.setWidth('auto');
      ref.setHeight('fit-content');
      expect(container.width()).toBe('100%');
      expect(container.height()).toBe('100%');
    });

    it('applies the width and height reported by the resizer', async () => {
      await openContainer();
      container.onResizerWidth('300px');
      container.onResizerHeight('200px');
      expect(container.width()).toBe('300px');
      expect(container.height()).toBe('200px');
    });

    it('ignores resizer values that do not start with a number', async () => {
      await openContainer();
      container.onResizerWidth('300px');
      container.onResizerHeight('200px');
      container.onResizerWidth('auto');
      container.onResizerHeight('');
      container.onResizerWidth(undefined as any);
      expect(container.width()).toBe('300px');
      expect(container.height()).toBe('200px');
    });

    it('moves the window to the drop position and resets the drag source', async () => {
      const ref = await openContainer();
      const setPos = vi.spyOn(ref, 'setPos');
      const reset = vi.fn();
      const element = document.createElement('div');
      element.getBoundingClientRect = () => ({ left: 120, top: 45 } as DOMRect);
      container.onDragEnded({ source: { element: { nativeElement: element }, reset } } as any);
      expect(reset).toHaveBeenCalledTimes(1);
      expect(setPos).toHaveBeenCalledWith('120px', '45px');
    });

    it('exposes the window context and the content slots', async () => {
      const ref = await openContainer();
      expect(container.windowRef).toBe(ref);
      expect(container.context.id).toBe('c');
      expect(container.containerRef().nativeElement.classList).toContain('rounded-xl');
      expect(container.windowContainerResizer()).toBeInstanceOf(WindowResizerComponent);
    });

    it('does not disable dragging by default and disables it on request', async () => {
      await openContainer();
      expect(q('.cdk-drag-disabled')).toBeNull();
      service.allActiveWindows.forEach((w) => w.complete());
      const ref = service.open({ id: 'nd', component: PlainContentComponent, draggable: false });
      await flush();
      expect(ref.draggable).toBe(false);
      expect(q('.cdk-drag-disabled')).not.toBeNull();
    });

    it('renders the footer toolbar only when a footer portal is set', async () => {
      await openContainer();
      expect(q('rxap-window-container mat-toolbar.mat-elevation-z1')).toBeNull();
    });

  });

  describe('WindowResizerComponent', () => {

    let ref: ReturnType<WindowService['open']>;
    let resizer: HTMLElement;
    let element: HTMLElement;
    let component: WindowResizerComponent;
    const events: Record<'width' | 'height' | 'resizing', unknown[]> = { width: [], height: [], resizing: [] };

    const mouse = (type: string, pageX: number, pageY: number, target: EventTarget) => {
      const event = new MouseEvent(type, { bubbles: true, clientX: pageX, clientY: pageY });
      // jsdom does not provide pageX/pageY for synthetic events
      Object.defineProperty(event, 'pageX', { value: pageX });
      Object.defineProperty(event, 'pageY', { value: pageY });
      target.dispatchEvent(event);
    };

    const openResizer = async (settings: Record<string, unknown> = {}) => {
      setup();
      events.width = [];
      events.height = [];
      events.resizing = [];
      ref = service.open({ id: 'r', component: PlainContentComponent, minWidth: '0', minHeight: '0', ...settings });
      await flush();
      resizer = q('rxap-window-resizer .resizer')!;
      component = getComponent<WindowResizerComponent>(q('rxap-window-resizer')!);
      component.width$.subscribe((v) => events.width.push(v));
      component.height$.subscribe((v) => events.height.push(v));
      component.resizing$.subscribe((v) => events.resizing.push(v));
      // jsdom has no layout: describe the container size with inline styles
      element = q('.rxap-window-container > div')!;
      element.style.width = '400px';
      element.style.height = '300px';
    };

    it('renders the resizer handle with a visible icon before the first resize', async () => {
      await openResizer();
      expect(resizer).toBeTruthy();
      expect(component.resizing()).toBeNull();
      expect(q('rxap-window-resizer mat-icon')!.classList).not.toContain('hidden');
    });

    it('resizes the window while the mouse is dragged', async () => {
      await openResizer();
      mouse('mousedown', 100, 100, resizer);
      expect(component.resizing()).toBe(true);
      mouse('mousemove', 150, 130, window);
      expect(events.width).toEqual(['450px']);
      expect(events.height).toEqual(['330px']);
      expect(ref.width$.value).toBe('450px');
      expect(ref.height$.value).toBe('330px');
      expect(ref.getSizeConfig().width).toBe('450px');
      expect(ref.getSizeConfig().height).toBe('330px');
      mouse('mousemove', 90, 70, window);
      expect(events.width).toEqual(['450px', '390px']);
      expect(events.height).toEqual(['330px', '270px']);
    });

    it('emits the resizing state on start and end of the resize action', async () => {
      await openResizer();
      mouse('mousedown', 0, 0, resizer);
      expect(events.resizing).toEqual([true]);
      mouse('mouseup', 0, 0, window);
      expect(events.resizing).toEqual([true, false]);
      expect(component.resizing()).toBe(false);
    });

    it('hides the icon after a resize action has finished', async () => {
      await openResizer();
      mouse('mousedown', 0, 0, resizer);
      mouse('mouseup', 0, 0, window);
      await flush();
      expect(q('rxap-window-resizer mat-icon')!.classList).toContain('hidden');
    });

    it('stops resizing after the mouse button was released', async () => {
      await openResizer();
      mouse('mousedown', 100, 100, resizer);
      mouse('mouseup', 100, 100, window);
      mouse('mousemove', 200, 200, window);
      expect(events.width).toEqual([]);
      expect(events.height).toEqual([]);
    });

    it('can resize again after a finished resize action', async () => {
      await openResizer();
      mouse('mousedown', 100, 100, resizer);
      mouse('mouseup', 100, 100, window);
      mouse('mousedown', 100, 100, resizer);
      expect(component.resizing()).toBe(true);
      mouse('mousemove', 110, 120, window);
      expect(events.width).toEqual(['410px']);
      expect(events.height).toEqual(['320px']);
    });

    it('does not shrink the window below the minimum size', async () => {
      await openResizer({ minWidth: '380', minHeight: '280' });
      mouse('mousedown', 100, 100, resizer);
      // 400 - 50 = 350 < 380
      mouse('mousemove', 50, 150, window);
      expect(events.width).toEqual([]);
      expect(events.height).toEqual([]);
      // 400 - 10 = 390 >= 380 and 300 - 10 = 290 >= 280
      mouse('mousemove', 90, 90, window);
      expect(events.width).toEqual(['390px']);
      expect(events.height).toEqual(['290px']);
    });

    it('stops listening to the mouse after the component was destroyed', async () => {
      await openResizer();
      component.ngOnDestroy();
      mouse('mousedown', 100, 100, resizer);
      mouse('mousemove', 150, 150, window);
      expect(events.width).toEqual([]);
      expect(component.resizing()).toBeNull();
    });

  });

  describe('WindowContentComponent', () => {

    it('renders a template portal', async () => {
      setup();
      service.open({ id: 'tpl', template: host.componentInstance.plain() });
      await flush();
      expect(q('rxap-window-content .tpl')!.textContent).toBe('template');
    });

    it('re-renders the content after the loading indicator of the content reported loading', async () => {
      setup();
      vi.useFakeTimers();
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      try {
        const ref = service.open({ id: 'loading', component: LoadingContentComponent });
        // the change detector ref is created when the content is attached: spy as soon as it is available
        const calls: number[] = [];
        ref.attachedRef$.subscribe((attachedRef) => {
          const cdr = (attachedRef as ComponentRef<any>).changeDetectorRef;
          const original = cdr.detectChanges.bind(cdr);
          cdr.detectChanges = () => {
            calls.push(Date.now());
            original();
          };
        });
        host.detectChanges();
        await vi.advanceTimersByTimeAsync(0);
        const attached = getComponent<LoadingContentComponent>(q('rxap-test-loading-content')!);
        expect(attached).toBeInstanceOf(LoadingContentComponent);
        // the initial render during attach
        const before = calls.length;
        attached.text = 'updated';
        await vi.advanceTimersByTimeAsync(99);
        const early = calls.length;
        await vi.advanceTimersByTimeAsync(2);
        // one additional render once the loading indicator emitted (delayed by 100ms)
        expect(calls.length).toBe(early + 1);
        expect(early).toBeGreaterThanOrEqual(before);
        expect(q('.loaded')!.textContent).toBe('updated');
        expect(warn).toHaveBeenCalledWith('The component has a loading indicator member');
      } finally {
        warn.mockRestore();
      }
    });

    it('warns in dev mode when the content never attaches', async () => {
      setup();
      vi.useFakeTimers();
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const errors: unknown[] = [];
      const previous = config.onUnhandledError;
      config.onUnhandledError = (error) => void errors.push(error);
      try {
        // neither a component nor a template: the portal never attaches
        service.open({ id: 'never' });
        host.detectChanges();
        await vi.advanceTimersByTimeAsync(9999);
        expect(warn).not.toHaveBeenCalledWith('The window content never resolved the attached ref');
        await vi.advanceTimersByTimeAsync(2);
        expect(warn).toHaveBeenCalledWith('The window content never resolved the attached ref');
        expect(errors).toHaveLength(1);
        expect(errors[0]).toHaveProperty('name', 'TimeoutError');
      } finally {
        config.onUnhandledError = previous;
        warn.mockRestore();
      }
    });

  });

  describe('directives', () => {

    it('provides the template context guard of the title directive', () => {
      expect(WindowTitleDirective.ngTemplateContextGuard(null as any, {})).toBe(true);
    });

    it('provides the template context guard of the footer directive', () => {
      expect(WindowFooterDirective.ngTemplateContextGuard(null as any, {})).toBe(true);
    });

  });

});
