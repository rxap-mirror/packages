import { TestBed } from '@angular/core/testing';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { of, Subject, throwError } from 'rxjs';
import { RxapFirebaseMessagingService } from './firebase-messaging.service';
import { RXAP_REQUEST_CLOUD_MESSAGING_TOKEN } from './tokens';

jest.mock('@angular/fire/compat/messaging', () => ({ AngularFireMessaging: class {} }));

describe('RxapFirebaseMessagingService', () => {
  let messages$: Subject<any>;
  let messaging: any;
  const NotificationMock = jest.fn();

  function create(requestImmediately?: boolean) {
    TestBed.configureTestingModule({
      providers: [
        { provide: AngularFireMessaging, useValue: messaging },
        ...(requestImmediately === undefined ? [] : [{ provide: RXAP_REQUEST_CLOUD_MESSAGING_TOKEN, useValue: requestImmediately }]),
      ],
    });
    return TestBed.inject(RxapFirebaseMessagingService);
  }

  beforeEach(() => {
    messages$ = new Subject();
    messaging = {
      messages: messages$.asObservable(),
      requestPermission: of(null),
      tokenChanges: of('token-1'),
    };
    NotificationMock.mockReset();
    (NotificationMock as any).permission = 'granted';
    (window as any).Notification = NotificationMock;
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
    delete (window as any).Notification;
  });

  it('shows a notification for incoming messages', () => {
    create();
    messages$.next({ notification: { title: 'T', body: 'B' } });
    expect(NotificationMock).toHaveBeenCalledWith('T', { body: 'B' });
  });

  it('does not request permission by default', () => {
    const s = create();
    let got = false;
    s.token$.subscribe(() => (got = true));
    expect(got).toBe(false);
  });

  it('requests permission immediately when configured and publishes the token', () => {
    const s = create(true);
    let token: string | null = null;
    s.token$.subscribe((t) => (token = t));
    expect(token).toBe('token-1');
    expect(console.info).toHaveBeenCalled();
  });

  it('logs an error when permission is denied', () => {
    messaging.requestPermission = throwError(() => new Error('denied'));
    create(true);
    expect(console.error).toHaveBeenCalledWith('cloud messaging permission is denied');
  });

  it('warns when notification permission is not granted', () => {
    (NotificationMock as any).permission = 'denied';
    create().showNotification('a', 'b');
    expect(NotificationMock).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith('Notification permission is not granted');
  });

  it('alerts when notifications are unsupported', () => {
    delete (window as any).Notification;
    const alertSpy = jest.fn();
    window.alert = alertSpy;
    create().showNotification('a', 'b');
    expect(alertSpy).toHaveBeenCalled();
  });
});
