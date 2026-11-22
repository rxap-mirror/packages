import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { Method } from '@rxap/pattern';
import { GetTableHeaderButtonMetadata, TableHeaderButtonMethod } from './decorators';
import { TableHeaderButtonDirective } from './table-header-button.directive';
import { TABLE_HEADER_BUTTON_METHOD } from './tokens';

const calls: string[] = [];
let shouldFail = false;

@TableHeaderButtonMethod({ refresh: true, tooltip: 'tip', successMessage: 'ok!', errorMessage: 'nope' })
class Action implements Method {
  async call() {
    calls.push('call');
    if (shouldFail) {
      throw new Error('boom');
    }
  }
}

@TableHeaderButtonMethod({ confirm: true })
class ConfirmAction implements Method {
  async call() {
    calls.push('confirm');
  }
}

@TableHeaderButtonMethod()
class PlainAction implements Method {
  async call() {
    calls.push('plain');
  }
}

class Undecorated implements Method {
  call() {
    return null;
  }
}

@Component({
  standalone: true,
  imports: [TableHeaderButtonDirective, MatButtonModule, MatTooltipModule],
  template: `<button mat-mini-fab [rxapTableHeaderButton]="dataSource" matTooltip="x" [refresh]="refresh" [rxapConfirm]="confirm"></button>`,
})
class HostComponent {
  dataSource = { refresh: jest.fn() };
  refresh: boolean | undefined = undefined;
  confirm = false;
}

describe('TableHeaderButtonDirective', () => {
  const snackBar = { open: jest.fn() };

  function setup(method: any, configure?: (host: HostComponent) => void) {
    calls.length = 0;
    shouldFail = false;
    snackBar.open.mockClear();
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: TABLE_HEADER_BUTTON_METHOD, useValue: method },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    });
    const fixture = TestBed.createComponent(HostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    const directive = fixture.debugElement
      .query(By.directive(TableHeaderButtonDirective))
      .injector.get(TableHeaderButtonDirective);
    return { fixture, host: fixture.componentInstance, directive };
  }

  it('reads decorator metadata', () => {
    expect(GetTableHeaderButtonMetadata(new Action()).refresh).toBe(true);
    expect(() => GetTableHeaderButtonMetadata(new Undecorated())).toThrow('empty');
  });

  it('executes the method, refreshes and shows the success message', async () => {
    const { directive, host, fixture } = setup(new Action());
    await directive.onClick(new Event('click'));
    expect(calls).toEqual(['call']);
    expect(host.dataSource.refresh).toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith('ok!', 'ok', { duration: 2560 });
    expect(fixture.nativeElement.querySelector('button')).toBeTruthy();
  });

  it('shows the error message on failure', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const { directive, host } = setup(new Action());
    shouldFail = true;
    await directive.execute();
    expect(snackBar.open).toHaveBeenCalledWith('nope', 'ok', { duration: 5120 });
    expect(host.dataSource.refresh).not.toHaveBeenCalled();
  });

  it('prefers the refresh input over the metadata', async () => {
    const { directive, host } = setup(new PlainAction(), (h) => (h.refresh = true));
    await directive.execute();
    expect(host.dataSource.refresh).toHaveBeenCalled();
    expect(snackBar.open).not.toHaveBeenCalled();
  });

  it('does not run concurrently', async () => {
    const { directive } = setup(new Action());
    await Promise.all([directive.execute(), directive.execute()]);
    expect(calls).toEqual(['call']);
  });

  it('opens a confirm overlay for confirm actions', async () => {
    const { directive } = setup(new ConfirmAction());
    const open = jest.spyOn(directive as any, 'openConfirmOverly').mockImplementation();
    await directive.onClick();
    expect(open).toHaveBeenCalled();
    expect(calls).toEqual([]);
  });

  it('waits for the rxapConfirm directive', async () => {
    jest.spyOn(console, 'debug').mockImplementation(() => undefined);
    const { directive } = setup(new PlainAction(), (h) => (h.confirm = true));
    await directive.onClick();
    expect(calls).toEqual([]);
    await directive.onConfirmed();
    expect(calls).toEqual(['plain']);
  });
});
