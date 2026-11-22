import { ComponentType } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { EMPTY } from 'rxjs';
import { ErrorCaptureService } from './error-capture.service';
import { RXAP_ERROR_CAPTURE_DIALOG_SERVICE } from './tokens';
import { AnyHttpErrorService } from './any-http-error/any-http-error.service';
import { MessageHttpErrorService } from './message-http-error/message-http-error.service';
import { CodeHttpErrorService } from './code-http-error/code-http-error.service';
import { OpenApiHttpResponseErrorService } from './open-api-http-response-error/open-api-http-response-error.service';
import { AngularErrorService } from './error/angular-error.service';
import { AnyHttpErrorComponent } from './any-http-error/any-http-error.component';
import { MessageHttpErrorComponent } from './message-http-error/message-http-error.component';
import { CodeHttpErrorComponent } from './code-http-error/code-http-error.component';
import { OpenApiHttpResponseErrorComponent } from './open-api-http-response-error/open-api-http-response-error.component';
import { AngularErrorComponent } from './error/angular-error.component';

class TestService extends ErrorCaptureService<{ id: number }> {
  protected readonly component = AnyHttpErrorComponent as ComponentType<any>;
  compare(a: { id: number }, b: { id: number }) {
    return a.id === b.id;
  }
}

describe('ErrorCaptureService', () => {
  const open = jest.fn(() => EMPTY);

  beforeEach(() => {
    open.mockClear();
    TestBed.configureTestingModule({
      providers: [
        TestService,
        { provide: RXAP_ERROR_CAPTURE_DIALOG_SERVICE, useValue: { open } },
      ],
    });
  });

  it('opens a dialog for the first error', () => {
    TestBed.inject(TestService).push({ id: 1 });
    expect(open).toHaveBeenCalledTimes(1);
    expect(open.mock.calls[0][1]()).toEqual([{ id: 1 }]);
  });

  it('appends equal errors to the open list', () => {
    const service = TestBed.inject(TestService);
    service.push({ id: 1 });
    service.push({ id: 1 });
    expect(open).toHaveBeenCalledTimes(1);
    expect((open.mock.calls[0] as any[])[1]()).toHaveLength(2);
  });

  it('opens a new dialog for a different error', () => {
    const service = TestBed.inject(TestService);
    service.push({ id: 1 });
    service.push({ id: 2 });
    expect(open).toHaveBeenCalledTimes(2);
  });
});

describe('error services', () => {
  const base = {
    url: 'u', method: 'GET', status: 500, message: 'm',
  } as any;

  beforeEach(() => TestBed.configureTestingModule({
    providers: [{ provide: RXAP_ERROR_CAPTURE_DIALOG_SERVICE, useValue: { open: jest.fn() } }],
  }));

  it('AnyHttpErrorService compares url, method, status and message', () => {
    const s = TestBed.inject(AnyHttpErrorService);
    expect((s as any).component).toBe(AnyHttpErrorComponent);
    expect(s.compare(base, { ...base })).toBe(true);
    expect(s.compare(base, { ...base, url: 'x' })).toBe(false);
    expect(s.compare(base, { ...base, method: 'POST' })).toBe(false);
    expect(s.compare(base, { ...base, status: 404 })).toBe(false);
    expect(s.compare(base, { ...base, message: 'z' })).toBe(false);
  });

  it('MessageHttpErrorService also compares the error message', () => {
    const s = TestBed.inject(MessageHttpErrorService);
    expect((s as any).component).toBe(MessageHttpErrorComponent);
    const a = { ...base, error: { message: 'a' } };
    expect(s.compare(a, { ...a, error: { message: 'a' } })).toBe(true);
    expect(s.compare(a, { ...a, error: { message: 'b' } })).toBe(false);
  });

  it('CodeHttpErrorService also compares the error code', () => {
    const s = TestBed.inject(CodeHttpErrorService);
    expect((s as any).component).toBe(CodeHttpErrorComponent);
    const a = { ...base, errorCode: 1 };
    expect(s.compare(a, { ...a })).toBe(true);
    expect(s.compare(a, { ...a, errorCode: 2 })).toBe(false);
  });

  it('OpenApiHttpResponseErrorService and AngularErrorService always match', () => {
    const o = TestBed.inject(OpenApiHttpResponseErrorService);
    expect((o as any).component).toBe(OpenApiHttpResponseErrorComponent);
    expect(o.compare({} as any, {} as any)).toBe(true);
    const a = TestBed.inject(AngularErrorService);
    expect((a as any).component).toBe(AngularErrorComponent);
    expect(a.compare({} as any, {} as any)).toBe(true);
  });
});
