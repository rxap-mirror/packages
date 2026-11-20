import {
  Component,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IfTruthyDirective } from './if-truthy.directive';

@Component({
  standalone: true,
  imports: [ IfTruthyDirective ],
  template: `
    <ng-template [rxapIfTruthy]="method" [rxapIfTruthyParameters]="parameters()" [rxapIfTruthyTrackBy]="trackBy" let-data>
      <span>{{ data.id }}</span>
    </ng-template>
  `,
})
class HostComponent {
  public readonly parameters = signal<object>({});
  public method: any;
  public trackBy: any;
}

describe('@rxap/directives', () => {

  describe('IfTruthyDirective', () => {

    async function setup(callImpl: () => Promise<any>) {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.componentInstance.method = { call: jest.fn(callImpl) };
      fixture.componentInstance.trackBy = (data: any) => data.id;
      fixture.detectChanges();
      await fixture.whenStable();
      const directive = fixture.debugElement.queryAllNodes(By.directive(IfTruthyDirective))[0].injector.get(IfTruthyDirective);
      return { fixture, directive, method: fixture.componentInstance.method };
    }

    it('should not rebuild the view when the trackBy value is unchanged', async () => {
      // each call resolves to a NEW object with the same id
      const { fixture, directive } = await setup(() => Promise.resolve({ id: 1 }));
      const spy = jest.spyOn((directive as any).viewContainerRef, 'createEmbeddedView');

      await (directive as any).execute();
      await (directive as any).execute();
      fixture.detectChanges();

      expect(spy).not.toHaveBeenCalled();
      expect(fixture.nativeElement.querySelectorAll('span').length).toBe(1);
    });

    it('should rebuild the view when the trackBy value changes', async () => {
      let id = 1;
      const { fixture, directive } = await setup(() => Promise.resolve({ id: id++ }));
      const spy = jest.spyOn((directive as any).viewContainerRef, 'createEmbeddedView');

      await (directive as any).execute();
      await (directive as any).execute();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should execute again when the parameters change', async () => {
      const { fixture, method } = await setup(() => Promise.resolve({ id: 1 }));
      expect(method.call).toHaveBeenCalledTimes(1);

      fixture.componentInstance.parameters.set({ other: true });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(method.call).toHaveBeenCalledTimes(2);
    });

  });

});
