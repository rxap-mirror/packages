import { ApplicationRef, Component, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import {
  RXAP_ERROR_DIALOG_DISABLED,
  RXAP_ERROR_DIALOG_ERROR,
} from '@rxap/ngx-error';
import { ComponentDialogComponent } from './component-dialog/component-dialog.component';
import { ComponentDialogService } from './component-dialog/component-dialog.service';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from './confirm-dialog/confirm-dialog.service';
import { ErrorCaptureDialogComponent } from './error-capture-dialog/error-capture-dialog.component';
import { ErrorCaptureDialogService } from './error-capture-dialog/error-capture-dialog.service';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';
import { MessageDialogService } from './message-dialog/message-dialog.service';

@Component({ selector: 'rxap-inner', template: '<span class="inner">{{ error?.message ?? "inner" }}</span>' })
class InnerComponent {
  error = inject(RXAP_ERROR_DIALOG_ERROR, { optional: true });
}

const overlay = () => document.querySelector('.cdk-overlay-container') as HTMLElement;
const buttons = () => Array.from(overlay().querySelectorAll('button'));
const button = (text: string) => buttons().find((b) => b.textContent!.trim() === text)!;
const tick = () => TestBed.inject(ApplicationRef).tick();

describe('dialogs', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
    });
  });
  afterEach(() => {
    TestBed.inject(MatDialog).closeAll();
    overlay()?.remove();
  });

  describe('MessageDialog', () => {
    const data = {
      title: 'Title',
      message: '<b>bold</b> message',
      actions: [
        { type: 'yes', label: 'Yes', color: 'primary' as const },
        { type: 'no', label: 'No', color: 'warn' as const },
      ],
    };

    it('renders title, html message and actions', async () => {
      const promise = TestBed.inject(MessageDialogService).open(data, { width: '300px' });
      tick();
      expect(overlay().querySelector('h2')!.textContent).toBe('Title');
      expect(overlay().querySelector('.content b')!.textContent).toBe('bold');
      expect(buttons().map((b) => b.textContent!.trim())).toEqual(['Cancel', 'Yes', 'No']);
      button('Yes').click();
      await expect(promise).resolves.toBe('yes');
    });

    it('resolves false on cancel', async () => {
      const promise = TestBed.inject(MessageDialogService).open(data);
      tick();
      button('Cancel').click();
      await expect(promise).resolves.toBe(false as any);
    });

    it('component exposes its data', () => {
      TestBed.configureTestingModule({ providers: [{ provide: MAT_DIALOG_DATA, useValue: data }] });
      const fixture = TestBed.createComponent(MessageDialogComponent);
      expect(fixture.componentInstance.data).toBe(data);
    });
  });

  describe('ConfirmDialog', () => {
    it('resolves true on confirm and uses the custom action label', async () => {
      const promise = TestBed.inject(ConfirmDialogService).open('Sure?', 'Delete');
      tick();
      expect(overlay().querySelector('.content')!.textContent).toBe('Sure?');
      button('Delete').click();
      await expect(promise).resolves.toBe(true);
    });

    it('resolves false on cancel and defaults the label to OK', async () => {
      const promise = TestBed.inject(ConfirmDialogService).open('Sure?', undefined, { width: '200px' });
      tick();
      expect(buttons().map((b) => b.textContent!.trim())).toEqual(['Cancel', 'OK']);
      button('Cancel').click();
      await expect(promise).resolves.toBe(false);
    });

    it('resolves false when closed without result', async () => {
      const promise = TestBed.inject(ConfirmDialogService).open('Sure?');
      tick();
      TestBed.inject(MatDialog).closeAll();
      await expect(promise).resolves.toBe(false);
    });

    it('component derives the action', () => {
      TestBed.configureTestingModule({ providers: [{ provide: MAT_DIALOG_DATA, useValue: { message: 'm' } }] });
      expect(TestBed.createComponent(ConfirmDialogComponent).componentInstance.action).toBe('OK');
    });
  });

  describe('ComponentDialog', () => {
    it('renders the component with a title and resolves on close', async () => {
      const promise = TestBed.inject(ComponentDialogService).open(InnerComponent, { data: { title: 'Dlg' } });
      tick();
      expect(overlay().querySelector('h2')!.textContent).toBe('Dlg');
      expect(overlay().querySelector('.inner')!.textContent).toBe('inner');
      button('Close').click();
      await expect(promise).resolves.toBe(true);
    });

    it('omits the title when not given', async () => {
      const promise = TestBed.inject(ComponentDialogService).open(InnerComponent);
      tick();
      expect(overlay().querySelector('h2')).toBeNull();
      TestBed.inject(MatDialog).closeAll();
      await expect(promise).resolves.toBeUndefined();
    });

    it('component exposes data', () => {
      TestBed.configureTestingModule({ providers: [{ provide: MAT_DIALOG_DATA, useValue: { component: InnerComponent, title: 'T' } }] });
      const c = TestBed.createComponent(ComponentDialogComponent).componentInstance;
      expect(c.title).toBe('T');
      expect(c.component).toBe(InnerComponent);
      expect(c.portal.component).toBe(InnerComponent);
    });
  });

  describe('ErrorCaptureDialog', () => {
    it('shows the first error and navigates between errors', () => {
      const errorList = signal([{ message: 'e1' }, { message: 'e2' }, { message: 'e3' }]);
      TestBed.inject(ErrorCaptureDialogService).open(InnerComponent, errorList).subscribe();
      tick();
      expect(overlay().querySelector('.inner')!.textContent).toBe('e1');
      expect(button('Previous').disabled).toBe(true);
      button('Next').click();
      tick();
      expect(overlay().querySelector('.inner')!.textContent).toBe('e2');
      button('3').click();
      tick();
      expect(overlay().querySelector('.inner')!.textContent).toBe('e3');
      expect(button('Next').disabled).toBe(true);
      button('Previous').click();
      tick();
      expect(overlay().querySelector('.inner')!.textContent).toBe('e2');
    });

    it('hides the controls for a single error', () => {
      TestBed.inject(ErrorCaptureDialogService).open(InnerComponent, signal([{ message: 'only' }])).subscribe();
      tick();
      expect(overlay().querySelector('.controls')).toBeNull();
    });

    it('emits and completes when the dialog is closed', async () => {
      const next = vi.fn();
      const complete = vi.fn();
      // closing is asynchronous without zone.js (the dialog finishes closing after a render), so wait for completion
      const completed = new Promise<void>((resolve) => {
        TestBed.inject(ErrorCaptureDialogService).open(InnerComponent, signal([{ message: 'x' }])).subscribe({
          next,
          complete: () => {
            complete();
            resolve();
          },
        });
      });
      tick();
      button('Close').click();
      tick();
      await completed;
      expect(next).toHaveBeenCalledTimes(1);
      expect(complete).toHaveBeenCalled();
    });

    it('closes the dialog on unsubscribe', () => {
      const sub = TestBed.inject(ErrorCaptureDialogService).open(InnerComponent, signal([{ message: 'x' }])).subscribe();
      tick();
      sub.unsubscribe();
      expect(TestBed.inject(MatDialog).openDialogs.length).toBe(1);
    });

    it('computes displayed buttons', () => {
      TestBed.configureTestingModule({
        providers: [{
          provide: MAT_DIALOG_DATA,
          useValue: { component: InnerComponent, errorList: signal(Array.from({ length: 10 }, (_, i) => i)) },
        }],
      });
      const c = TestBed.createComponent(ErrorCaptureDialogComponent).componentInstance;
      c.activeIndex.set(5);
      expect(c.displayedButtons()).toEqual([3, 4, 5, 6, 7]);
    });

    it('does nothing when disabled', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } },
          { provide: RXAP_ERROR_DIALOG_DISABLED, useValue: true },
        ],
      });
      vi.spyOn(console, 'debug').mockImplementation(() => undefined);
      const complete = vi.fn();
      TestBed.inject(ErrorCaptureDialogService).open(InnerComponent, signal([])).subscribe({ complete });
      expect(complete).toHaveBeenCalled();
      expect(TestBed.inject(MatDialog).openDialogs.length).toBe(0);
    });
  });
});
