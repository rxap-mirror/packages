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
import {
  ControlHideShowDirective,
  UseHideFunction,
  UseShowFunction,
} from './control-hide-show.directive';

interface IForm {
  mode: string;
  hidden: string;
  shown: string;
  both: string;
  root: string;
}

@RxapForm('hide-show-test')
class TestForm implements FormType<IForm> {
  @UseFormControl()
  mode!: RxapFormControl<string>;

  @UseHideFunction(function (this: TestForm) {
    const v = this.mode.value;
    return v === 'hide' ? true : v === 'show' ? false : null;
  })
  @UseFormControl()
  hidden!: RxapFormControl<string>;

  @UseShowFunction(function (this: TestForm) {
    const v = this.mode.value;
    return v === 'show' ? true : v === 'hide' ? false : null;
  })
  @UseFormControl()
  shown!: RxapFormControl<string>;

  @UseHideFunction(() => true)
  @UseShowFunction(() => false)
  @UseFormControl()
  both!: RxapFormControl<string>;

  @UseHideFunction(() => false, { rootChange: true })
  @UseFormControl()
  root!: RxapFormControl<string>;
}

describe('ControlHideShowDirective', () => {
  function build() {
    return new RxapFormBuilder<IForm>(TestForm).build({ mode: 'x' });
  }

  describe('with NgControl', () => {
    @Component({
      imports: [ReactiveFormsModule, ControlHideShowDirective],
      template: `
        <input class="mode" [formControl]="form.mode" />
        <input class="hidden" [formControl]="form.hidden" rxapControlHideShow />
        <input class="shown" [formControl]="form.shown" rxapControlHideShow />
        <input class="root" [formControl]="form.root" rxapControlHideShow />
      `,
    })
    class Host {
      form = build();
    }

    function create() {
      const f = TestBed.createComponent(Host);
      f.detectChanges();
      return f;
    }
    const el = (f: any, cls: string) => f.nativeElement.querySelector('.' + cls) as HTMLElement;

    it('hides, shows and resets by the hide function', () => {
      const f = create();
      const form = f.componentInstance.form;
      expect(el(f, 'hidden').style.display).toBe('');
      form.mode.setValue('hide');
      expect(el(f, 'hidden').style.display).toBe('none');
      form.mode.setValue('show');
      expect(el(f, 'hidden').style.display).toBe('block');
      form.mode.setValue('x');
      expect(el(f, 'hidden').style.display).toBe('');
    });

    it('hides, shows and resets by the show function', () => {
      const f = create();
      const form = f.componentInstance.form;
      form.mode.setValue('show');
      expect(el(f, 'shown').style.display).toBe('block');
      form.mode.setValue('hide');
      expect(el(f, 'shown').style.display).toBe('none');
      form.mode.setValue('x');
      expect(el(f, 'shown').style.display).toBe('');
    });

    it('supports root change option', () => {
      const f = create();
      f.componentInstance.form.mode.setValue('y');
      expect(el(f, 'root').style.display).toBe('block');
    });

    it('stops reacting after destroy', () => {
      const f = create();
      const form = f.componentInstance.form;
      f.destroy();
      expect(() => form.mode.setValue('hide')).not.toThrow();
    });
  });

  describe('with a control id and parent container', () => {
    @Component({
      imports: [ReactiveFormsModule, ControlHideShowDirective],
      template: `
        <form [formGroup]="form.rxapFormGroup">
          <div class="target" rxapControlHideShow="both"></div>
        </form>
      `,
    })
    class Host {
      form = build();
    }

    it('extracts the control from the parent and applies both functions', () => {
      const f = TestBed.createComponent(Host);
      f.detectChanges();
      const dir = f.debugElement.query((d) => d.nativeElement.classList?.contains('target')).injector.get(ControlHideShowDirective);
      expect(dir.control).toBe(f.componentInstance.form.both);
      // show function (false) runs first, then hide function (true)
      expect((f.nativeElement.querySelector('.target') as HTMLElement).style.display).toBe('none');
    });
  });

  describe('errors', () => {
    it('throws without NgControl and ControlContainer', () => {
      @Component({ imports: [ControlHideShowDirective], template: `<div rxapControlHideShow="x"></div>` })
      class Bad {}
      const f = TestBed.createComponent(Bad);
      expect(() => f.detectChanges()).toThrow('Easier the ControlContainer or NgControl must be injectable');
    });

    it('throws when a container exists but no control id is given', () => {
      @Component({
        imports: [ReactiveFormsModule, ControlHideShowDirective],
        template: `<form [formGroup]="form.rxapFormGroup"><div rxapControlHideShow></div></form>`,
      })
      class Bad {
        form = build();
      }
      const f = TestBed.createComponent(Bad);
      expect(() => f.detectChanges()).toThrow('control id must be defined');
    });

    it('throws when the control is not a RxapFormControl', () => {
      @Component({
        imports: [ReactiveFormsModule, ControlHideShowDirective],
        template: `<input [formControl]="control" rxapControlHideShow />`,
      })
      class Bad {
        control = new (require('@angular/forms').FormControl)('');
      }
      const f = TestBed.createComponent(Bad);
      expect(() => f.detectChanges()).toThrow('not an instance of RxapFormControl');
    });

    it('logs errors thrown by the functions and keeps the stream alive', () => {
      const err = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      @RxapForm('hide-show-error')
      class ErrForm {
        @UseHideFunction(() => {
          throw new Error('boom');
        })
        @UseFormControl()
        name!: RxapFormControl<string>;
      }
      @Component({
        imports: [ReactiveFormsModule, ControlHideShowDirective],
        template: `<input [formControl]="form.name" rxapControlHideShow />`,
      })
      class Host {
        form = new RxapFormBuilder<{ name: string }>(ErrForm as any).build() as any;
      }
      const f = TestBed.createComponent(Host);
      f.detectChanges();
      expect(err).toHaveBeenCalled();
      err.mockRestore();
    });

    it('does nothing when no function is registered for the control', () => {
      @Component({
        imports: [ReactiveFormsModule, ControlHideShowDirective],
        template: `<input class="m" [formControl]="form.mode" rxapControlHideShow />`,
      })
      class Host {
        form = build();
      }
      const f = TestBed.createComponent(Host);
      f.detectChanges();
      expect((f.nativeElement.querySelector('.m') as HTMLElement).style.display).toBe('');
    });
  });
});
