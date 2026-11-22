import { Component, signal, TemplateRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { By } from '@angular/platform-browser';
import { ConfigService } from '@rxap/config';
import { AuthorizationService } from './authorization.service';
import { FormControlHasEnablePermissionDirective } from './form-control-has-enable-permission.directive';
import { HasWritePermissionDirective } from './has-write-permission.directive';
import { IfHasPermissionDirective } from './if-has-permission.directive';
import { MatButtonHasEnablePermissionDirective } from './mat-button-has-enable-permission.directive';
import { MatCheckboxHasEnablePermissionDirective } from './mat-checkbox-has-enable-permission.directive';
import { MatInputHasEnablePermissionDirective } from './mat-input-has-enable-permission.directive';
import { MatSelectHasEnablePermissionDirective } from './mat-select-has-enable-permission.directive';
import { MatSlideToggleHasEnablePermissionDirective } from './mat-slide-toggle-has-enable-permission.directive';
import { provideAuthorization, setAuthorizationScope } from './provide';
import { RXAP_AUTHORIZATION_SCOPE, RXAP_DISABLE_AUTHORIZATION } from './tokens';

describe('provide', () => {
  it('provides the service and reads the disabled flag from config', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ConfigService, useValue: { get: (k: string) => (k === 'authorization.disabled' ? true : undefined) } },
        provideAuthorization(),
      ],
    });
    expect(TestBed.inject(RXAP_DISABLE_AUTHORIZATION)).toBe(true);
    expect(TestBed.inject(AuthorizationService).disabled).toBe(true);
  });

  it('setAuthorizationScope provides the scope token', () => {
    expect(setAuthorizationScope('a.b')).toEqual({ provide: RXAP_AUTHORIZATION_SCOPE, useValue: 'a.b' });
  });
});

describe('AuthorizationService extras', () => {
  let service: AuthorizationService;
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    service = TestBed.inject(AuthorizationService);
  });
  afterEach(() => jest.restoreAllMocks());

  it('stores and returns copies of permissions', () => {
    service.setPermissions(['a']);
    const p = service.getPermissions();
    p.push('b');
    expect(service.getPermissions()).toEqual(['a']);
    let last: string[] = [];
    service.getPermissions$().subscribe((v) => (last = v));
    service.setPermissions(['x', 'y']);
    expect(last).toEqual(['x', 'y']);
  });

  it('hasPermission honors the ignore list', () => {
    service.setPermissions(['a', 'b']);
    expect(service.hasPermission('a')).toBe(true);
    expect(service.hasPermission('a', null, ['a'])).toBe(false);
    expect(service.hasPermission(['a', 'b'])).toBe(true);
    expect(service.hasPermission(['a', 'c'])).toBe(false);
  });

  it('hasPermission$ emits distinct values and honors the ignore list', () => {
    const values: boolean[] = [];
    service.hasPermission$('a', null, ['z']).subscribe((v) => values.push(v));
    service.setPermissions(['b']);
    service.setPermissions(['a']);
    service.setPermissions(['a', 'c']);
    service.setPermissions(['*']);
    service.setPermissions(['z']);
    expect(values).toEqual([false, true, false]);
  });

  it('an empty identifier list is always permitted', () => {
    expect(service.checkPermission([], [])).toBe(true);
  });

  it('wildcard prefix and suffix patterns', () => {
    expect(service.checkPermission('a.b.edit', ['*.edit'])).toBe(true);
    expect(service.checkPermission('a.b.edit', ['*.b.*'])).toBe(true);
    expect(service.checkPermission('a.b.edit', ['*.view'])).toBe(false);
  });

  it('grants everything when authorization is disabled', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: RXAP_DISABLE_AUTHORIZATION, useValue: true }] });
    expect(TestBed.inject(AuthorizationService).checkPermission('x', [])).toBe(true);
    expect(console.warn).toHaveBeenCalled();
  });
});

@Component({
  standalone: true,
  imports: [IfHasPermissionDirective],
  template: `
    <ng-template #fallback><span id="else">no</span></ng-template>
    <div id="host">
      <span id="content" *rxapIfHasPermission="id(); else fallbackRef()">yes</span>
    </div>
  `,
})
class IfHostComponent {
  id = signal('a.b');
  fallbackRef = signal<TemplateRef<any> | undefined>(undefined);
  fallback = viewChild<TemplateRef<any>>('fallback');
}

@Component({
  standalone: true,
  imports: [IfHasPermissionDirective],
  template: `<ng-template #fb><span id="else">no</span></ng-template><span id="content" *rxapIfHasPermission="id(); else fb">yes</span>`,
})
class IfElseHostComponent {
  id = signal('a.b');
}

@Component({
  standalone: true,
  imports: [IfHasPermissionDirective],
  template: `<span id="content" *rxapIfHasPermission="'a.b'">yes</span>`,
})
class IfNoElseHostComponent {}

describe('IfHasPermissionDirective', () => {
  let auth: AuthorizationService;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    TestBed.configureTestingModule({});
    auth = TestBed.inject(AuthorizationService);
  });
  afterEach(() => jest.restoreAllMocks());

  it('renders nothing without else template when denied and content when granted', () => {
    const f = TestBed.createComponent(IfNoElseHostComponent);
    f.detectChanges();
    expect(f.nativeElement.querySelector('#content')).toBeNull();
    auth.setPermissions(['a.*']);
    f.detectChanges();
    expect(f.nativeElement.querySelector('#content')).not.toBeNull();
    auth.setPermissions([]);
    f.detectChanges();
    expect(f.nativeElement.querySelector('#content')).toBeNull();
  });

  it('renders the else template when denied', () => {
    const f = TestBed.createComponent(IfElseHostComponent);
    f.detectChanges();
    expect(f.nativeElement.querySelector('#else')).not.toBeNull();
    expect(f.nativeElement.querySelector('#content')).toBeNull();
    auth.setPermissions(['a.b']);
    f.detectChanges();
    expect(f.nativeElement.querySelector('#else')).toBeNull();
    expect(f.nativeElement.querySelector('#content')).not.toBeNull();
  });

  it('re-evaluates when the identifier input changes', () => {
    auth.setPermissions(['a.b']);
    const f = TestBed.createComponent(IfElseHostComponent);
    f.detectChanges();
    expect(f.nativeElement.querySelector('#content')).not.toBeNull();
    f.componentInstance.id.set('other');
    f.detectChanges();
    f.detectChanges();
    expect(f.nativeElement.querySelector('#content')).toBeNull();
    expect(f.nativeElement.querySelector('#else')).not.toBeNull();
  });

  it('respects the authorization scope', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [setAuthorizationScope('feature')] });
    TestBed.inject(AuthorizationService).setPermissions(['feature/a.b']);
    const f = TestBed.createComponent(IfNoElseHostComponent);
    f.detectChanges();
    expect(f.nativeElement.querySelector('#content')).not.toBeNull();
  });

  it('IfHostComponent compiles with the template wiring', () => {
    const f = TestBed.createComponent(IfHostComponent);
    f.componentInstance.fallbackRef.set(undefined);
    f.detectChanges();
    expect(f.nativeElement.querySelector('#content')).toBeNull();
  });
});

@Component({
  standalone: true,
  imports: [HasWritePermissionDirective],
  template: `<input [rxapHasWritePermission]="id()" />`,
})
class WriteHostComponent {
  id = signal('a.b');
}

describe('HasWritePermissionDirective', () => {
  it('toggles the readonly attribute', () => {
    jest.spyOn(console, 'log').mockImplementation();
    const auth = TestBed.inject(AuthorizationService);
    const f = TestBed.createComponent(WriteHostComponent);
    const input = (): HTMLInputElement => f.nativeElement.querySelector('input');
    f.detectChanges();
    expect(input().readOnly).toBe(true);
    auth.setPermissions(['a.b']);
    f.detectChanges();
    expect(input().readOnly).toBe(false);
    f.componentInstance.id.set('x.y');
    f.detectChanges();
    f.detectChanges();
    expect(input().readOnly).toBe(true);
    jest.restoreAllMocks();
  });
});

@Component({
  standalone: true,
  imports: [
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    MatButtonHasEnablePermissionDirective,
    MatInputHasEnablePermissionDirective,
    MatSelectHasEnablePermissionDirective,
    MatCheckboxHasEnablePermissionDirective,
    MatSlideToggleHasEnablePermissionDirective,
    FormControlHasEnablePermissionDirective,
  ],
  template: `
    <button id="btn" mat-button rxapHasEnablePermission="btn.perm">b</button>
    <button id="plain" mat-icon-button rxapHasEnablePermission="icon.perm">i</button>
    <input id="input" matInput rxapHasEnablePermission="input.perm" />
    <mat-select id="select" rxapHasEnablePermission="select.perm"></mat-select>
    <mat-checkbox id="check" rxapHasEnablePermission="check.perm"></mat-checkbox>
    <mat-slide-toggle id="toggle" rxapHasEnablePermission="toggle.perm"></mat-slide-toggle>
    <input id="ctrl" [formControl]="control" rxapHasEnablePermission="ctrl.perm" />
  `,
})
class EnableHostComponent {
  control = new FormControl('x');
}

describe('HasEnablePermission directives', () => {
  let auth: AuthorizationService;
  let f: ReturnType<typeof TestBed.createComponent<EnableHostComponent>>;

  const dir = <T>(type: new (...a: any[]) => T, id: string): T =>
    f.debugElement.query(By.css('#' + id)).injector.get(type);

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    auth = TestBed.inject(AuthorizationService);
    f = TestBed.createComponent(EnableHostComponent);
    f.detectChanges();
  });
  afterEach(() => jest.restoreAllMocks());

  it('disables everything without permissions', () => {
    const { MatButton, MatIconButton } = jest.requireActual('@angular/material/button');
    expect(dir(MatButton, 'btn').disabled).toBe(true);
    expect(dir(MatIconButton, 'plain').disabled).toBe(true);
    expect(f.nativeElement.querySelector('#input').disabled).toBe(true);
    expect(f.nativeElement.querySelector('#select').getAttribute('aria-disabled')).toBeDefined();
    expect(f.componentInstance.control.disabled).toBe(true);
  });

  it('enables each element once its permission is granted', () => {
    const { MatButton } = jest.requireActual('@angular/material/button');
    auth.setPermissions(['*']);
    f.detectChanges();
    expect(dir(MatButton, 'btn').disabled).toBe(false);
    expect(f.nativeElement.querySelector('#input').disabled).toBe(false);
    expect(f.componentInstance.control.enabled).toBe(true);
    auth.setPermissions(['btn.perm']);
    f.detectChanges();
    expect(dir(MatButton, 'btn').disabled).toBe(false);
    expect(f.nativeElement.querySelector('#input').disabled).toBe(true);
    expect(f.componentInstance.control.disabled).toBe(true);
  });

  it('toggles checkbox, select and slide-toggle independently', () => {
    const select = dir(MatSelectHasEnablePermissionDirective, 'select');
    const check = dir(MatCheckboxHasEnablePermissionDirective, 'check');
    const toggle = dir(MatSlideToggleHasEnablePermissionDirective, 'toggle');
    const spies = [select, check, toggle].map((d) => jest.spyOn(d, 'setDisabled'));
    auth.setPermissions(['*']);
    f.detectChanges();
    spies.forEach((s) => expect(s).toHaveBeenLastCalledWith(false));
    auth.setPermissions(['select.perm', 'toggle.perm']);
    f.detectChanges();
    expect(spies[0]).toHaveBeenLastCalledWith(false);
    expect(spies[1]).toHaveBeenLastCalledWith(true);
    expect(spies[2]).toHaveBeenLastCalledWith(false);
  });
});
