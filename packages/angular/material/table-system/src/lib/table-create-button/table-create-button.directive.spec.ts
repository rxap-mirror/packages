import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { TableCreateButtonDirective } from './table-create-button.directive';
import { TABLE_CREATE_REMOTE_METHOD } from './tokens';

@Component({
  standalone: true,
  imports: [TableCreateButtonDirective],
  template: `<button [rxapTableCreate]="dataSource">create</button>`,
})
class HostComponent {
  dataSource: any = { refresh: jest.fn() };
}

describe('TableCreateButtonDirective', () => {
  function setup(result: any) {
    const method = { call: jest.fn().mockResolvedValue(result) };
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: TABLE_CREATE_REMOTE_METHOD, useValue: method }],
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return { fixture, method, host: fixture.componentInstance, button: fixture.nativeElement.querySelector('button') };
  }

  it('calls the method and refreshes the data source', async () => {
    const { method, host, button } = setup({ id: 1 });
    button.click();
    await Promise.resolve();
    await Promise.resolve();
    expect(method.call).toHaveBeenCalled();
    expect(host.dataSource.refresh).toHaveBeenCalled();
  });

  it('waits for an observable result', async () => {
    const { host, button } = setup(of(1));
    button.click();
    await new Promise((r) => setTimeout(r));
    expect(host.dataSource.refresh).toHaveBeenCalled();
  });

  it('completes a subject result on destroy', async () => {
    const subject = new Subject<any>();
    const { host, fixture, button } = setup(subject);
    button.click();
    await new Promise((r) => setTimeout(r));
    // the observable never completes; destroying completes it and the refresh follows
    expect(host.dataSource.refresh).not.toHaveBeenCalled();
    fixture.destroy();
    expect(subject.isStopped).toBe(true);
  });
});
