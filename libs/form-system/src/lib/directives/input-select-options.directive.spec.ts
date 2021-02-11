import { TestBed } from '@angular/core/testing';
import {
  TemplateRef,
  ViewContainerRef,
  ChangeDetectorRef,
  InjectionToken
} from '@angular/core';
import { InputSelectOptionsDirective } from '@rxap/form-system';

describe('@rxap/form-system', () => {

  describe('InputSelectOptionsDirective', () => {

    it('should handle unresolvable data source injection', () => {

      TestBed.configureTestingModule({
        providers: [
          {
            provide:  TemplateRef,
            useValue: null
          },
          {
            provide:  ViewContainerRef,
            useValue: null
          },
          {
            provide:  ChangeDetectorRef,
            useValue: null
          },
          InputSelectOptionsDirective
        ]
      });

      const inputSelectOptions = TestBed.inject<InputSelectOptionsDirective>(InputSelectOptionsDirective);

      const useDataSourceValueMap = new Map();

      const injectionToken = new InjectionToken('testing');

      useDataSourceValueMap.set('options', {
        dataSource: injectionToken
      });

      const loadOptions        = spyOn<any>(inputSelectOptions, 'loadOptions');
      const extractControl     = spyOn<any>(inputSelectOptions, 'extractControl');
      const formDefinition     = spyOn<any>(inputSelectOptions, 'extractFormDefinition');
      const extractDataSources = spyOn<any>(inputSelectOptions, 'extractDataSources').and.returnValue(useDataSourceValueMap);

      Reflect.set(inputSelectOptions, 'control', {});

      expect(() => inputSelectOptions.ngOnInit())
        .toThrow(/Cloud not inject the options data source:/);

    });

  });

});
