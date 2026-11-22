import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import {
  FormType,
  RxapForm,
  RxapFormBuilder,
  RxapFormControl,
  UseFormControl,
} from '@rxap/forms';
import { RemoteMethodLoader } from '@rxap/remote-method';
import {
  OptionsFromRemoteMethodDirective,
  UseOptionsRemoteMethod,
  UseRemoteMethod,
} from './options-from-remote-method.directive';

class FakeRemoteMethod {}

interface IForm {
  withMethod: string;
  other: string;
  none: string;
}

@RxapForm('options-from-remote-method-test')
class TestForm implements FormType<IForm> {
  @UseOptionsRemoteMethod(FakeRemoteMethod as any)
  @UseFormControl()
  withMethod!: RxapFormControl<string>;

  @UseRemoteMethod(FakeRemoteMethod as any, 'not-options')
  @UseFormControl()
  other!: RxapFormControl<string>;

  @UseFormControl()
  none!: RxapFormControl<string>;
}

describe('OptionsFromRemoteMethodDirective', () => {
  const call$ = jest.fn();

  function create(control: keyof IForm, attrs: string) {
    @Component({
      imports: [ReactiveFormsModule, OptionsFromRemoteMethodDirective],
      template: '<select [formControl]="form.' + control + '"><option *rxapOptionsFromRemoteMethod="let o' + attrs + '" [value]="o.value">{{ o.display }}</option></select>',
    })
    class Host {
      form = new RxapFormBuilder<IForm>(TestForm).build({ withMethod: 'a' });
      params = signal<any>(undefined);
    }
    TestBed.configureTestingModule({
      providers: [{ provide: RemoteMethodLoader, useValue: { call$ } }],
    });
    const f = TestBed.createComponent(Host);
    return f;
  }

  const labels = (f: any) =>
    Array.from(f.nativeElement.querySelectorAll('option')).map((o: any) => o.textContent.trim());

  beforeEach(() => {
    call$.mockReset().mockResolvedValue([
      { value: 'a', display: 'Alpha' },
      { value: 'b', display: 'Beta' },
    ]);
  });

  it('renders the options loaded with the bound parameters', async () => {
    const f = create('withMethod', '; parameters: { id: 1 }');
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(call$).toHaveBeenCalledWith(FakeRemoteMethod, { id: 1 }, undefined, expect.anything());
    expect(labels(f)).toEqual(['Alpha', 'Beta']);
  });

  it('loads without parameters when requested', async () => {
    const f = create('withMethod', '; withoutParameters: true');
    f.detectChanges();
    await f.whenStable();
    expect(call$).toHaveBeenCalledWith(FakeRemoteMethod, undefined, undefined, expect.anything());
    expect(labels(f).length).toBe(2);
  });

  it('does nothing without parameters', async () => {
    const f = create('withMethod', '');
    f.detectChanges();
    await f.whenStable();
    expect(call$).not.toHaveBeenCalled();
  });

  it('resets the control with the resetOnChange value', async () => {
    const f = create('withMethod', "; parameters: { id: 1 }; resetOnChange: 'x'");
    f.detectChanges();
    await f.whenStable();
    expect(f.componentInstance.form.withMethod.value).toBe('x');
  });

  it('throws if the options method is not registered', () => {
    const f = create('other', '; withoutParameters: true');
    expect(() => {
      f.detectChanges();
      TestBed.tick();
    }).toThrow(/options' is not defined/);
  });

  it('throws if the control has no remote method definitions', () => {
    const f = create('none', '; withoutParameters: true');
    expect(() => {
      f.detectChanges();
      TestBed.tick();
    }).toThrow(/does not exists/);
  });
});
