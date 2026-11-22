import { Component, inject, TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import {
  RXAP_WINDOW_DATA,
  RXAP_WINDOW_DEFAULT_SETTINGS,
  RXAP_WINDOW_REF,
  RXAP_WINDOW_SETTINGS,
} from './tokens';
import { WindowFooterDirective } from './window-footer.directive';
import { WindowRef } from './window-ref';
import { WindowService } from './window.service';
import { WindowTitleDirective } from './window-title.directive';

@Component({
  standalone: true,
  selector: 'rxap-test-content',
  template: `<span class="content">{{ data?.text }}</span>`,
})
class ContentComponent {
  data = inject(RXAP_WINDOW_DATA);
  ref = inject(RXAP_WINDOW_REF);
}

@Component({
  standalone: true,
  selector: 'rxap-test-settings-content',
  template: `settings`,
  providers: [{ provide: RXAP_WINDOW_SETTINGS, useValue: { title: 'From Component' } }],
})
class SettingsContentComponent {}

@Component({
  standalone: true,
  selector: 'rxap-test-loading-content',
  template: `loading`,
})
class LoadingContentComponent {
  loading$ = new Subject<boolean>();
}

@Component({
  standalone: true,
  imports: [WindowTitleDirective, WindowFooterDirective],
  selector: 'rxap-test-portal-content',
  template: `
    <ng-template rxapWindowTitle let-ref><i class="custom-title">custom {{ ref.id }}</i></ng-template>
    <ng-template rxapWindowFooter let-ref><u class="custom-footer">footer {{ ref.id }}</u></ng-template>
    <p class="tpl-body">body</p>
  `,
})
class PortalContentComponent {}

@Component({
  standalone: true,
  template: `<ng-template #plain><b class="tpl">template</b></ng-template>`,
})
class HostComponent {
  plain = viewChild.required<TemplateRef<any>>('plain');
}

describe('WindowService', () => {
  let service: WindowService;
  let host: ComponentFixture<HostComponent>;
  const q = (sel: string) => document.querySelector(sel) as HTMLElement | null;

  const setup = (providers: any[] = []) => {
    TestBed.configureTestingModule({
      imports: [HostComponent, MatIconTestingModule, NoopAnimationsModule],
      providers,
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

  afterEach(() => {
    service?.allActiveWindows.forEach((w) => w.complete());
    document.body.innerHTML = '';
  });

  it('opens a component window and injects data and ref', async () => {
    setup();
    const ref = service.open({ id: 'w1', component: ContentComponent, data: { text: 'hello' }, title: 'Title' });
    await flush();
    expect(service.has('w1')).toBe(true);
    expect(service.get('w1')).toBe(ref);
    expect(service.hasActiveWindows).toBe(true);
    expect(service.activeWindowCount).toBe(1);
    expect(service.allActiveWindows).toEqual([ref]);
    expect(q('.rxap-window-container')!.getAttribute('data-id')).toBe('w1');
    expect(q('.content')!.textContent).toBe('hello');
    expect(ref.id).toBe('w1');
    expect(ref.draggable).toBe(true);
    expect(ref.minimizable).toBe(false);
    expect(ref.minWidth).toBe('384px');
    expect(ref.minHeight).toBe('192px');
    expect(ref.maxWidth).toBe('100vw');
    expect(ref.maxHeight).toBe('100vh');
    // settings of the window are rendered in the tool bar
    expect(q('rxap-window-tool-bar h3')!.textContent).toBe('Title');
  });

  it('generates an id when none is given and applies default settings', async () => {
    setup([{ provide: RXAP_WINDOW_DEFAULT_SETTINGS, useValue: { minWidth: '10px', minHeight: '20px' } }]);
    const ref = service.open({ component: ContentComponent });
    await flush();
    expect(ref.id).toBeTruthy();
    const cfg = ref.getSizeConfig();
    expect(cfg.minWidth).toBe('10px');
    expect(cfg.minHeight).toBe('20px');
  });

  it('returns the existing window when the id is already open', () => {
    setup();
    const a = service.open({ id: 'same', component: ContentComponent });
    const b = service.open({ id: 'same', component: ContentComponent });
    expect(b).toBe(a);
    expect(service.activeWindowCount).toBe(1);
  });

  it('throws for unknown windows', () => {
    setup();
    expect(() => service.get('x')).toThrow("Active Window with id 'x' not found");
    expect(() => service.close('x')).toThrow();
  });

  it('closing a window removes it and emits the active count', async () => {
    setup();
    const counts: number[] = [];
    service.activeCount$.subscribe((c) => counts.push(c));
    service.open({ id: 'a', component: ContentComponent });
    service.open({ id: 'b', component: ContentComponent });
    service.close('a');
    expect(service.has('a')).toBe(false);
    expect(counts).toEqual([1, 2, 1]);
    expect(service.remove('missing')).toBe(false);
    service.close('b');
    expect(service.hasActiveWindows).toBe(false);
  });

  it('closes the window on backdrop click', async () => {
    setup();
    const ref = service.open({ id: 'bd', component: ContentComponent });
    const completed = jest.fn();
    ref.subscribe({ complete: completed });
    (ref as any).overlayRef.backdropClick().subscribe;
    (ref as any).overlayRef._backdropClick.next(new MouseEvent('click'));
    expect(completed).toHaveBeenCalled();
    expect(service.has('bd')).toBe(false);
  });

  it('renders custom title and footer portals', async () => {
    setup();
    const ref = service.open({ id: 't', component: PortalContentComponent });
    await flush();
    await flush();
    expect(q('.tpl-body')).toBeTruthy();
    expect(q('.custom-title')!.textContent).toBe('custom t');
    expect(q('.custom-footer')!.textContent).toBe('footer t');
    expect(ref).toBeInstanceOf(WindowRef);
  });

  it('renders a plain template', async () => {
    setup();
    service.open({ id: 'p', template: host.componentInstance.plain(), title: 'Plain', minimizable: true });
    await flush();
    expect(q('.tpl')).toBeTruthy();
    expect(q('rxap-window-tool-bar button mat-icon')!.textContent).toBe('minimize');
  });

  it('merges settings provided by the content component', async () => {
    setup();
    service.open({ id: 's', component: SettingsContentComponent, title: 'Orig' });
    await flush();
    expect(q('rxap-window-tool-bar h3')!.textContent).toBe('From Component');
  });

  it('attaches a loading$ member of the content component', async () => {
    setup();
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    service.open({ id: 'l', component: LoadingContentComponent });
    await flush();
    expect(warn).toHaveBeenCalledWith('The component has a loading indicator member');
    warn.mockRestore();
  });

  it('shows no progress bar when idle', async () => {
    setup();
    service.open({ id: 'li', component: ContentComponent });
    await flush();
    expect(q('mat-progress-bar')).toBeNull();
  });

  it('tool bar buttons minimize, maximize and close', async () => {
    setup();
    const ref = service.open({ id: 'tb', component: ContentComponent, minimizable: true });
    await flush();
    const buttons = Array.from(document.querySelectorAll('rxap-window-tool-bar button')) as HTMLButtonElement[];
    expect(buttons).toHaveLength(3);
    buttons[0].click();
    expect(ref.isMinimized).toBe(true);
    buttons[1].click();
    expect(ref.getSizeConfig().width).toBe('100vw');
    buttons[2].click();
    expect(service.has('tb')).toBe(false);
  });

  it('task bar lists open windows and reopens/closes them', async () => {
    const { WindowTaskBarContainerComponent } = await import(
      './window-task-bar/window-task-bar-container/window-task-bar-container.component'
    );
    setup();
    const bar = TestBed.createComponent(WindowTaskBarContainerComponent);
    bar.detectChanges();
    expect(bar.nativeElement.querySelector('rxap-window-task-bar')).toBeNull();
    const ref = service.open({ id: 'task', component: ContentComponent, title: 'My Task', minimizable: true });
    await flush();
    bar.detectChanges();
    await bar.whenStable();
    bar.detectChanges();
    const task = bar.nativeElement.querySelector('rxap-window-task') as HTMLElement;
    expect(task).toBeTruthy();
    await flush();
    bar.detectChanges();
    expect(task.querySelector('h3')?.textContent).toBe('My Task');
    ref.minimize();
    (task.querySelector('.rxap-container') as HTMLElement).click();
    expect(ref.isMinimized).toBe(false);
    // toggle expand
    const toggle = bar.nativeElement.querySelector('button.pin') as HTMLButtonElement;
    toggle.click();
    expect(bar.componentInstance.expand).toBe(false);
    (task.querySelector('button') as HTMLButtonElement).click();
    expect(service.has('task')).toBe(false);
    bar.detectChanges();
    await bar.whenStable();
    expect(bar.nativeElement.querySelector('rxap-window-task-bar')).toBeNull();
  });

  it('task bar container honors the settings token', async () => {
    const { WindowTaskBarContainerComponent, RXAP_WINDOW_TASK_BAR_CONTAINER_SETTINGS } = await import(
      './window-task-bar/window-task-bar-container/window-task-bar-container.component'
    );
    setup([{ provide: RXAP_WINDOW_TASK_BAR_CONTAINER_SETTINGS, useValue: { expand: false } }]);
    expect(TestBed.createComponent(WindowTaskBarContainerComponent).componentInstance.expand).toBe(false);
  });

  it('action bar shows the removed hint when actions are defined', async () => {
    const { WindowActionBarComponent } = await import('./window-action-bar/window-action-bar.component');
    const { RXAP_WINDOW_CONTEXT } = await import('./tokens');
    const mk = (actions: any) => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: RXAP_WINDOW_CONTEXT, useValue: { windowRef: { settings: { actions } } } }],
      });
      const f = TestBed.createComponent(WindowActionBarComponent);
      f.detectChanges();
      return f;
    };
    expect(mk(undefined).nativeElement.textContent.trim()).toBe('');
    const f = mk({ position: 'end', definitions: [] });
    expect(f.componentInstance.position).toBe('end');
    expect(f.nativeElement.textContent).toContain('this feature is removed');
    const g = mk({ definitions: [] });
    expect(g.componentInstance.position).toBe('start');
  });
});
