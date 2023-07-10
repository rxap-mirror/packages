import {TestBed} from '@angular/core/testing';
import {ChangeDetectorRef, InjectionToken, TemplateRef, ViewContainerRef} from '@angular/core';
import {InputSelectOptionsDirective} from './input-select-options.directive';

describe('@rxap/form-system', () => {

  describe('InputSelectOptionsDirective', () => {

    xit('should handle unresolvable data source injection', () => {

      TestBed.configureTestingModule({
        providers: [
          {
            provide: TemplateRef,
            useValue: null,
          },
          {
            provide: ViewContainerRef,
            useValue: null,
          },
          {
            provide: ChangeDetectorRef,
            useValue: null,
          },
          InputSelectOptionsDirective,
        ],
      });

      const inputSelectOptions = TestBed.inject<InputSelectOptionsDirective>(InputSelectOptionsDirective);

      const useDataSourceValueMap = new Map();

      const injectionToken = new InjectionToken('testing');

      useDataSourceValueMap.set('options', {
        dataSource: injectionToken,
      });

      const loadOptions = spyOn<any>(inputSelectOptions, 'loadOptions');
      const extractControl = spyOn<any>(inputSelectOptions, 'extractControl');
      const formDefinition = spyOn<any>(inputSelectOptions, 'extractFormDefinition');
      const extractDataSources = spyOn<any>(inputSelectOptions, 'extractDataSources').and.returnValue(useDataSourceValueMap);

      Reflect.set(inputSelectOptions, 'control', {});

      expect(() => inputSelectOptions.ngAfterViewInit())
        .toThrow(/Cloud not inject the options data source:/);

    });

  });

});
