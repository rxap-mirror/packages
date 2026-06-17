import { IfTruthyDirective } from './if-truthy.directive';

describe('@rxap/directives', () => {

  describe('IfTruthyDirective', () => {

    function setup(callImpl: () => Promise<any>) {
      const viewContainerRef: any = {
        clear: jest.fn(),
        createEmbeddedView: jest.fn(),
      };
      const cdr: any = { detectChanges: jest.fn() };
      const directive = new IfTruthyDirective<any>({} as any, viewContainerRef, cdr);
      directive.method = { call: jest.fn(callImpl) } as any;
      directive.parameters = {} as any;
      return { directive, viewContainerRef, cdr };
    }

    it('should not rebuild the view when the trackBy value is unchanged', async () => {
      // each call resolves to a NEW object with the same id
      const { directive, viewContainerRef } = setup(() => Promise.resolve({ id: 1 }));
      directive.trackBy = (data: any) => data.id;

      await (directive as any).execute();
      await (directive as any).execute();

      expect(viewContainerRef.createEmbeddedView).toHaveBeenCalledTimes(1);
    });

    it('should rebuild the view when the trackBy value changes', async () => {
      let id = 1;
      const { directive, viewContainerRef } = setup(() => Promise.resolve({ id: id++ }));
      directive.trackBy = (data: any) => data.id;

      await (directive as any).execute();
      await (directive as any).execute();

      expect(viewContainerRef.createEmbeddedView).toHaveBeenCalledTimes(2);
    });

  });

});
