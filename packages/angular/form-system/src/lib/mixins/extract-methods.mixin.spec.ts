import { InjectionToken } from '@angular/core';
import { FormDefinition, RxapFormGroup } from '@rxap/forms';
import { Mixin } from '@rxap/mixin';
import { ExtractMethodsMixin, UseMethod } from './extract-methods.mixin';

describe('ExtractMethodsMixin', () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Test extends ExtractMethodsMixin {}

  @Mixin(ExtractMethodsMixin)
  class Test {
    constructor(
      private readonly formDefinition: FormDefinition,
      private readonly controlId: string,
    ) {}

    public extract() {
      return this.extractMethods(this.formDefinition, this.controlId);
    }
  }

  const token = new InjectionToken<any>('mockToken');

  class DefinitionWithMethod {
    @UseMethod(token, 'mockKey')
    mockId!: unknown;
  }

  class DefinitionWithoutMethod {}

  const withPrototype = (proto: object) =>
    Object.assign(Object.create(proto), {
      rxapFormGroup: new RxapFormGroup({}, { controlId: 'form' }),
      rxapMetadata: { id: 'form' },
    }) as FormDefinition;

  beforeEach(() => vi.spyOn(console, 'log').mockImplementation(() => undefined));
  afterEach(() => vi.restoreAllMocks());

  it('should throw error if no method map is found', () => {
    const test = new Test(withPrototype(DefinitionWithoutMethod.prototype), 'mockId');
    expect(() => test.extract()).toThrow(
      new Error('Could not extract the use remote method map from the form definition instance'),
    );
  });

  it('should throw error if no method definition exists in metadata', () => {
    const test = new Test(withPrototype(DefinitionWithMethod.prototype), 'other');
    expect(() => test.extract()).toThrow(
      new Error('A use remote method definition does not exists in the form definition metadata'),
    );
  });

  it('should return the method definitions of the control on success', () => {
    const test = new Test(withPrototype(DefinitionWithMethod.prototype), 'mockId');
    const result = test.extract();
    expect(result.get('mockKey')).toEqual({ method: token, config: undefined });
  });
});
