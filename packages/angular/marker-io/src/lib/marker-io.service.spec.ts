import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ConfigService } from '@rxap/config';
import { RXAP_ENVIRONMENT } from '@rxap/environment';
import { PubSubService, RXAP_TOPICS } from '@rxap/ngx-pub-sub';
import { Subject } from 'rxjs';
import { MarkerIoService, provideMarkerIo } from './marker-io.service';

const widget = {
  setCustomData: jest.fn(),
  setReporter: jest.fn(),
  clearReporter: jest.fn(),
};
const loadWidget = jest.fn();

jest.mock('@marker.io/browser', () => ({
  __esModule: true,
  default: { loadWidget: (...args: any[]) => loadWidget(...args) },
}));

describe('MarkerIoService', () => {
  let config: Record<string, unknown>;
  let logout$: Subject<void>;

  beforeEach(() => {
    config = {};
    logout$ = new Subject();
    loadWidget.mockReset().mockResolvedValue(widget);
    widget.setCustomData.mockReset();
    widget.setReporter.mockReset();
    widget.clearReporter.mockReset();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
    TestBed.configureTestingModule({
      providers: [
        { provide: ConfigService, useValue: { get: (k: string) => config[k] } },
        {
          provide: RXAP_ENVIRONMENT,
          useValue: { tier: 'local', sentry: { dsn: 'x' }, slug: 's', name: 'app' },
        },
        {
          provide: PubSubService,
          useValue: {
            subscribe: jest.fn((topic: string) => {
              expect(topic).toBe(RXAP_TOPICS.authentication.logout);
              return logout$.asObservable();
            }),
          },
        },
      ],
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('warns when no configuration exists', async () => {
    await TestBed.inject(MarkerIoService).load();
    expect(loadWidget).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
  });

  it('errors when configuration is not an object', async () => {
    config['marker'] = 'nope';
    await TestBed.inject(MarkerIoService).load();
    expect(loadWidget).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it('does nothing when disabled', async () => {
    config['marker'] = { disabled: true, project: 'p' };
    await TestBed.inject(MarkerIoService).load();
    expect(loadWidget).not.toHaveBeenCalled();
  });

  it('errors without project key', async () => {
    config['marker'] = {};
    await TestBed.inject(MarkerIoService).load();
    expect(loadWidget).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it('loads the widget and sets filtered custom data', async () => {
    config['marker'] = { project: 'p' };
    await TestBed.inject(MarkerIoService).load();
    expect(loadWidget).toHaveBeenCalledWith({ project: 'p' });
    const data = widget.setCustomData.mock.calls[0][0];
    expect(data.tier).toBe('local');
    expect(data.sentry).toBeUndefined();
    expect(data.slug).toBeUndefined();
  });

  it('logs when the widget fails to load and still subscribes to logout', async () => {
    config['marker'] = { project: 'p' };
    loadWidget.mockRejectedValue(new Error('boom'));
    const service = TestBed.inject(MarkerIoService);
    await service.load();
    expect(console.error).toHaveBeenCalledWith('Failed to load marker.io widget:', 'boom');
    expect(() => service.clearReporter()).not.toThrow();
  });

  it('delegates reporter calls and clears on logout', async () => {
    config['marker'] = { project: 'p' };
    const service = TestBed.inject(MarkerIoService);
    service.setReporter({ email: 'a@b.c', fullName: 'A' });
    expect(widget.setReporter).not.toHaveBeenCalled();
    await service.load();
    service.setReporter({ email: 'a@b.c', fullName: 'A' });
    expect(widget.setReporter).toHaveBeenCalledWith({ email: 'a@b.c', fullName: 'A' });
    logout$.next();
    expect(widget.clearReporter).toHaveBeenCalledTimes(1);
  });

  it('provideMarkerIo runs load on app initialisation', async () => {
    config['marker'] = { project: 'p' };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideMarkerIo(),
        { provide: ConfigService, useValue: { get: (k: string) => config[k] } },
        { provide: RXAP_ENVIRONMENT, useValue: { tier: 'local' } },
        { provide: PubSubService, useValue: { subscribe: () => logout$.asObservable() } },
      ],
    });
    TestBed.inject(MarkerIoService);
    await TestBed.inject(ApplicationInitStatus).donePromise;
    expect(loadWidget).toHaveBeenCalled();
  });
});
