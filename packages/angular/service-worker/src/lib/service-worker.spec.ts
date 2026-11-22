import {
  ApplicationRef,
  EnvironmentProviders,
  Provider,
  ApplicationInitStatus,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  SwUpdate,
  VersionEvent,
} from '@angular/service-worker';
import { LifeCycleService } from '@rxap/life-cycle';
import {
  Observable,
  Subject,
} from 'rxjs';
import { AutoUpdateService } from './auto-update.service';
import { CheckForUpdateService } from './check-for-update.service';
import { DialogUpdateService } from './dialog-update.service';
import { LogUpdateService } from './log-update.service';
import {
  ProvideServiceWorkerUpdater,
  withAutoUpdater,
  withDialogUpdater,
  withLogUpdater,
  withSnackbarUpdater,
} from './provide-service-worker-updater';
import {
  ServiceWorkerUpdateDialogComponent,
  UPDATE_AVAILABLE_EVENT,
} from './service-worker-update-dialog/service-worker-update-dialog.component';
import { SnackbarUpdateService } from './snackbar-update.service';
import { UnregisterServiceWorker } from './unregister-service-worker';

const ready: VersionEvent = {
  type: 'VERSION_READY',
  currentVersion: { hash: 'old' },
  latestVersion: { hash: 'new' },
};
const noNew = { type: 'NO_NEW_VERSION_DETECTED', version: { hash: 'h' } } as VersionEvent;

function swUpdateMock(isEnabled = true) {
  return {
    isEnabled,
    versionUpdates: new Subject<VersionEvent>(),
    checkForUpdate: jest.fn().mockResolvedValue(true),
    activateUpdate: jest.fn().mockResolvedValue(true),
  };
}

describe('service worker', () => {
  // jsdom does not allow stubbing location; a reload surfaces as a "not implemented: navigation" error
  let reload: jest.Mock;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    reload = jest.spyOn(console, 'error').mockImplementation() as unknown as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('LogUpdateService', () => {
    it('logs all but NO_NEW_VERSION_DETECTED events', () => {
      const sw = swUpdateMock();
      TestBed.configureTestingModule({ providers: [{ provide: SwUpdate, useValue: sw }] });
      TestBed.inject(LogUpdateService).start();
      sw.versionUpdates.next(noNew);
      expect(console.log).not.toHaveBeenCalled();
      sw.versionUpdates.next(ready);
      expect(console.log).toHaveBeenCalledWith('version update event', ready);
    });
  });

  describe('AutoUpdateService', () => {
    it('activates and reloads on VERSION_READY only', async () => {
      const sw = swUpdateMock();
      TestBed.configureTestingModule({ providers: [{ provide: SwUpdate, useValue: sw }] });
      TestBed.inject(AutoUpdateService).start();
      sw.versionUpdates.next(noNew);
      expect(sw.activateUpdate).not.toHaveBeenCalled();
      sw.versionUpdates.next(ready);
      expect(sw.activateUpdate).toHaveBeenCalledTimes(1);
      await Promise.resolve();
      await Promise.resolve();
      expect(reload).toHaveBeenCalled();
    });
  });

  describe('SnackbarUpdateService', () => {
    it('opens a snackbar and activates after dismissal', async () => {
      const sw = swUpdateMock();
      const dismissed = new Subject<void>();
      const snackBar = { open: jest.fn().mockReturnValue({ afterDismissed: () => dismissed }) };
      TestBed.configureTestingModule({
        providers: [
          { provide: SwUpdate, useValue: sw },
          { provide: MatSnackBar, useValue: snackBar },
        ],
      });
      TestBed.inject(SnackbarUpdateService).start();
      sw.versionUpdates.next(noNew);
      expect(snackBar.open).not.toHaveBeenCalled();
      sw.versionUpdates.next(ready);
      expect(snackBar.open).toHaveBeenCalledWith('A new version is available', 'Update');
      expect(sw.activateUpdate).not.toHaveBeenCalled();
      dismissed.next();
      expect(sw.activateUpdate).toHaveBeenCalledTimes(1);
      await Promise.resolve();
      await Promise.resolve();
      expect(reload).toHaveBeenCalled();
    });
  });

  describe('CheckForUpdateService', () => {
    function setup(isEnabled: boolean) {
      const sw = swUpdateMock(isEnabled);
      const lifeCycle = {
        whenReady: jest.fn((factory: () => Observable<unknown>) => factory()),
      };
      TestBed.configureTestingModule({
        providers: [
          { provide: SwUpdate, useValue: sw },
          { provide: LifeCycleService, useValue: lifeCycle },
        ],
      });
      return { sw, lifeCycle, service: TestBed.inject(CheckForUpdateService) };
    }

    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('checks immediately and then every 15 minutes', () => {
      const { sw, service } = setup(true);
      service.start();
      // direct call + startWith(null) call
      expect(sw.checkForUpdate).toHaveBeenCalledTimes(2);
      jest.advanceTimersByTime(15 * 60 * 1000);
      expect(sw.checkForUpdate).toHaveBeenCalledTimes(3);
      jest.advanceTimersByTime(15 * 60 * 1000);
      expect(sw.checkForUpdate).toHaveBeenCalledTimes(4);
    });

    it('only starts once', () => {
      const { sw, service } = setup(true);
      service.start();
      service.start();
      expect(sw.checkForUpdate).toHaveBeenCalledTimes(2);
      expect(console.warn).toHaveBeenCalledWith('check for update already started');
    });

    it('does nothing when the service worker is disabled', () => {
      const { sw, lifeCycle, service } = setup(false);
      service.start();
      expect(sw.checkForUpdate).not.toHaveBeenCalled();
      expect(lifeCycle.whenReady).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('service worker updates are not enabled');
    });
  });

  describe('ServiceWorkerUpdateDialogComponent', () => {
    beforeEach(() => {
      HTMLDialogElement.prototype.showModal = jest.fn();
      HTMLDialogElement.prototype.close = jest.fn();
    });

    it('shows modal after render and emits closeDialog on close', async () => {
      TestBed.configureTestingModule({
        providers: [{ provide: UPDATE_AVAILABLE_EVENT, useValue: ready }],
      });
      const fixture = TestBed.createComponent(ServiceWorkerUpdateDialogComponent);
      const closed = jest.fn();
      fixture.componentInstance.closeDialog.subscribe(closed);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
      const text = fixture.nativeElement.textContent as string;
      expect(text).toContain('old');
      expect(text).toContain('new');

      fixture.nativeElement.querySelector('button').click();
      expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
      expect(closed).toHaveBeenCalledTimes(1);
    });

    it.each([
      [{ type: 'VERSION_DETECTED', version: { hash: 'det-hash' } }, 'det-hash'],
      [{ type: 'VERSION_INSTALLATION_FAILED', version: { hash: 'fail-hash' }, error: 'boom' }, 'boom'],
      [{ type: 'NoNewVersionDetectedEvent', version: { hash: 'nn-hash' } }, 'nn-hash'],
    ])('renders %j', async (event, expected) => {
      TestBed.configureTestingModule({
        providers: [{ provide: UPDATE_AVAILABLE_EVENT, useValue: event }],
      });
      const fixture = TestBed.createComponent(ServiceWorkerUpdateDialogComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(fixture.nativeElement.textContent).toContain(expected);
    });
  });

  describe('DialogUpdateService', () => {
    it('creates the dialog on VERSION_READY, then activates and reloads after close', async () => {
      HTMLDialogElement.prototype.showModal = jest.fn();
      HTMLDialogElement.prototype.close = jest.fn();
      const sw = swUpdateMock();
      TestBed.configureTestingModule({ providers: [{ provide: SwUpdate, useValue: sw }] });
      TestBed.inject(DialogUpdateService).start();

      sw.versionUpdates.next(noNew);
      expect(document.body.querySelectorAll('div').length).toBe(0);

      sw.versionUpdates.next(ready);
      const host = document.body.querySelector('div') as HTMLElement;
      expect(host).toBeTruthy();
      TestBed.inject(ApplicationRef).tick();
      await new Promise(r => setTimeout(r));
      expect(host.textContent).toContain('new');
      expect(sw.activateUpdate).not.toHaveBeenCalled();

      host.querySelector('button')!.click();
      await new Promise(r => setTimeout(r));
      expect(sw.activateUpdate).toHaveBeenCalledTimes(1);
      expect(document.body.contains(host)).toBe(false);
      await Promise.resolve();
      await Promise.resolve();
      expect(reload).toHaveBeenCalled();
    });
  });

  describe('providers', () => {
    async function run(providers: Array<Provider | EnvironmentProviders>) {
      TestBed.configureTestingModule({ providers });
      await TestBed.inject(ApplicationInitStatus).donePromise;
    }

    it('ProvideServiceWorkerUpdater starts the check service', async () => {
      const start = jest.fn();
      await run(ProvideServiceWorkerUpdater({ provide: CheckForUpdateService, useValue: { start } }));
      expect(start).toHaveBeenCalled();
    });

    it.each([
      ['withLogUpdater', withLogUpdater, LogUpdateService],
      ['withDialogUpdater', withDialogUpdater, DialogUpdateService],
      ['withAutoUpdater', withAutoUpdater, AutoUpdateService],
      ['withSnackbarUpdater', withSnackbarUpdater, SnackbarUpdateService],
    ])('%s starts its service', async (_n, fn, token) => {
      const start = jest.fn();
      await run([fn(), { provide: token, useValue: { start } }]);
      expect(start).toHaveBeenCalledTimes(1);
    });
  });

  describe('UnregisterServiceWorker', () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');
    afterEach(() => {
      if (original) {
        Object.defineProperty(navigator, 'serviceWorker', original);
      } else {
        delete (navigator as any).serviceWorker;
      }
    });

    function mockRegistrations(regs: Array<{ scope: string; unregister: jest.Mock }>) {
      const getRegistrations = jest.fn().mockResolvedValue(regs);
      Object.defineProperty(navigator, 'serviceWorker', {
        configurable: true,
        value: { getRegistrations },
      });
      return getRegistrations;
    }

    it('does nothing when the service worker is enabled', () => {
      const get = mockRegistrations([]);
      UnregisterServiceWorker({ serviceWorker: true } as never);
      expect(get).not.toHaveBeenCalled();
    });

    it('unregisters all and reloads when confirmed', async () => {
      const regs = [{ scope: 'a', unregister: jest.fn() }, { scope: 'b', unregister: jest.fn() }];
      mockRegistrations(regs);
      const confirmSpy = jest.fn().mockReturnValue(true);
      (globalThis as any).confirm = confirmSpy;
      UnregisterServiceWorker({ serviceWorker: false } as never);
      await new Promise(r => setTimeout(r));
      regs.forEach(r => expect(r.unregister).toHaveBeenCalled());
      expect(confirmSpy).toHaveBeenCalled();
      expect(reload).toHaveBeenCalled();
    });

    it('does not reload when declined or when nothing was registered', async () => {
      mockRegistrations([{ scope: 'a', unregister: jest.fn() }]);
      const confirmSpy = jest.fn().mockReturnValue(false);
      (globalThis as any).confirm = confirmSpy;
      UnregisterServiceWorker({ serviceWorker: false } as never);
      await new Promise(r => setTimeout(r));
      expect(reload).not.toHaveBeenCalled();

      mockRegistrations([]);
      confirmSpy.mockClear();
      UnregisterServiceWorker({ serviceWorker: false } as never);
      await new Promise(r => setTimeout(r));
      expect(confirmSpy).not.toHaveBeenCalled();
    });

    it('tolerates a missing serviceWorker api', () => {
      delete (navigator as any).serviceWorker;
      expect(() => UnregisterServiceWorker({ serviceWorker: false } as never)).not.toThrow();
    });
  });
});
