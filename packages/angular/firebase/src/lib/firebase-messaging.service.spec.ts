import { TestBed } from '@angular/core/testing';
import { RxapFirebaseMessagingService } from './firebase-messaging.service';
import {
  FIREBASE_MESSAGING,
  FIREBASE_MESSAGING_VAPID_KEY,
  RXAP_REQUEST_CLOUD_MESSAGING_TOKEN,
} from './tokens';

const onMessageFn = jest.fn();
const getTokenFn = jest.fn();
jest.mock('firebase/messaging', () => ({
  onMessage: (...a: unknown[]) => onMessageFn(...a),
  getToken: (...a: unknown[]) => getTokenFn(...a),
}));

describe('RxapFirebaseMessagingService', () => {
  const messaging = { messaging: true };
  const NotificationMock: any = jest.fn();
  const originalServiceWorker = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');

  function create(options: { requestImmediately?: boolean; messaging?: unknown; vapid?: string } = {}) {
    TestBed.configureTestingModule({
      providers: [
        { provide: FIREBASE_MESSAGING, useValue: 'messaging' in options ? options.messaging : messaging },
        ...(options.vapid ? [{ provide: FIREBASE_MESSAGING_VAPID_KEY, useValue: options.vapid }] : []),
        ...(options.requestImmediately === undefined ? [] : [{ provide: RXAP_REQUEST_CLOUD_MESSAGING_TOKEN, useValue: options.requestImmediately }]),
      ],
    });
    return TestBed.inject(RxapFirebaseMessagingService);
  }

  beforeEach(() => {
    jest.clearAllMocks();
    NotificationMock.mockReset();
    NotificationMock.permission = 'granted';
    NotificationMock.requestPermission = jest.fn().mockResolvedValue('granted');
    (window as any).Notification = NotificationMock;
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { getRegistration: () => Promise.resolve('registration') },
    });
    getTokenFn.mockResolvedValue('token-1');
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
    delete (window as any).Notification;
    if (originalServiceWorker) Object.defineProperty(navigator, 'serviceWorker', originalServiceWorker);
    else delete (navigator as any).serviceWorker;
  });

  it('shows a notification for incoming messages', () => {
    create();
    const [ instance, handler ] = onMessageFn.mock.calls[0];
    expect(instance).toBe(messaging);
    handler({ notification: { title: 'T', body: 'B' } });
    expect(NotificationMock).toHaveBeenCalledWith('T', { body: 'B' });
  });

  it('ignores messages without a notification title', () => {
    create();
    onMessageFn.mock.calls[0][1]({ data: {} });
    expect(NotificationMock).not.toHaveBeenCalled();
  });

  it('does not subscribe to messages without messaging support', () => {
    create({ messaging: null });
    expect(onMessageFn).not.toHaveBeenCalled();
  });

  it('does not request permission by default', () => {
    const s = create();
    let got = false;
    s.token$.subscribe(() => (got = true));
    expect(got).toBe(false);
    expect(NotificationMock.requestPermission).not.toHaveBeenCalled();
  });

  it('requests permission immediately when configured and publishes the token', async () => {
    const s = create({ requestImmediately: true, vapid: 'vapid' });
    let token: string | null = null;
    s.token$.subscribe((t) => (token = t));
    await new Promise((resolve) => setTimeout(resolve));
    expect(token).toBe('token-1');
    expect(getTokenFn).toHaveBeenCalledWith(messaging, { vapidKey: 'vapid', serviceWorkerRegistration: 'registration' });
    expect(console.info).toHaveBeenCalled();
  });

  it('works without a vapid key and without service worker support', async () => {
    delete (navigator as any).serviceWorker;
    const s = create();
    await s.requestPermission();
    expect(getTokenFn).toHaveBeenCalledWith(messaging, { vapidKey: undefined, serviceWorkerRegistration: undefined });
  });

  it('logs an error when permission is denied', async () => {
    NotificationMock.requestPermission.mockResolvedValue('denied');
    const s = create();
    let got = false;
    s.token$.subscribe(() => (got = true));
    await s.requestPermission();
    expect(console.error).toHaveBeenCalledWith('cloud messaging permission is denied', expect.any(Error));
    expect(got).toBe(false);
    expect(getTokenFn).not.toHaveBeenCalled();
  });

  it('logs an error when the token request fails', async () => {
    getTokenFn.mockRejectedValue(new Error('no token'));
    await create().requestPermission();
    expect(console.error).toHaveBeenCalledWith('cloud messaging permission is denied', expect.any(Error));
  });

  it('warns instead of requesting permission without messaging support', async () => {
    await create({ messaging: null }).requestPermission();
    expect(console.warn).toHaveBeenCalledWith('firebase cloud messaging is not supported in this environment');
    expect(NotificationMock.requestPermission).not.toHaveBeenCalled();
  });

  it('warns when notification permission is not granted', () => {
    NotificationMock.permission = 'denied';
    create().showNotification('a', 'b');
    expect(NotificationMock).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith('Notification permission is not granted');
  });

  it('alerts when notifications are unsupported', () => {
    const s = create();
    delete (window as any).Notification;
    const alertSpy = jest.fn();
    window.alert = alertSpy;
    s.showNotification('a', 'b');
    expect(alertSpy).toHaveBeenCalled();
  });
});
