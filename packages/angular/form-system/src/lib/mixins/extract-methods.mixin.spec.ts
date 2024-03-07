import {
  InjectionToken,
  ProviderToken,
} from '@angular/core';
import {
  FormDefinition,
  RxapFormGroup,
} from '@rxap/forms';
import { Mixin } from '@rxap/mixin';
import { Method } from '@rxap/pattern';
import * as rxapReflectMetadata from '@rxap/reflect-metadata';
import { ExtractMethodsMixin } from './extract-methods.mixin';

describe('ExtractMethodsMixin', () => {

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Test extends ExtractMethodsMixin {
  }

  @Mixin(ExtractMethodsMixin)
  class Test {

    constructor(
      private readonly formDefinition: FormDefinition,
      private readonly controlId: string,
    ) {
    }

    public extract() {
      return this.extractMethods(this.formDefinition, this.controlId);
    }

  }

  let testClass: Test;
  let mockFormDefinition: FormDefinition;
  let mockControlId: string;
  let mockMethodTokenMap: Map<string, Map<string, ProviderToken<Method>>>;

  beforeEach(() => {
    mockControlId      = 'mockId';
    mockFormDefinition = {
      rxapFormGroup: new RxapFormGroup({}, {controlId: 'form'}),
      rxapMetadata: {id: 'form'},
    };
    testClass          = new Test(mockFormDefinition, mockControlId);
    mockMethodTokenMap = new Map([
      [
        mockControlId,
        new Map([
          [ 'mockKey', new InjectionToken('mockToken') ],
        ]),
      ],
    ]);
  });

  describe('extractMethods', () => {
    it('should throw error if no method map is found', () => {
      jest.spyOn(rxapReflectMetadata, 'getMetadata').mockReturnValue(null);

      expect(() => testClass.extract())
      .toThrow(new Error('Could not extract the use remote method map from the form definition instance'));
    });

    it('should throw error if no method definition exists in metadata', () => {
      jest.spyOn(rxapReflectMetadata, 'getMetadata').mockReturnValue(new Map());
      expect(() => testClass.extract())
      .toThrow(new Error('A use remote method definition does not exists in the form definition metadata'));
    });

    it('should return mapped control Id on success', () => {
      jest.spyOn(rxapReflectMetadata, 'getMetadata').mockReturnValue(mockMethodTokenMap);
      expect(testClass.extract())
      .toEqual(mockMethodTokenMap.get(mockControlId));
    });
  });
});
