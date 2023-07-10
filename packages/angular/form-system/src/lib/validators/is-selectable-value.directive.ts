import {
  AbstractControl,
  NG_VALIDATORS,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import {
  Directive,
  forwardRef,
  Inject,
  INJECTOR,
  Injector,
  Input,
  isDevMode,
} from '@angular/core';
import {
  BaseDataSourceViewer,
  DataSourceLoader,
} from '@rxap/data-source';
import { Mixin } from '@rxap/mixin';
import { ControlOptions } from '@rxap/utilities';
import { ExtractOptionsDataSourceMixin } from '../mixins/extract-options-data-source.mixin';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IsSelectableValueDirective extends ExtractOptionsDataSourceMixin {
}

@Mixin(ExtractOptionsDataSourceMixin)
@Directive({
  selector: '[rxapIsSelectableValue]',
  providers: [
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: forwardRef(() => IsSelectableValueDirective),
    },
  ],
  standalone: true,
})
export class IsSelectableValueDirective implements Validator {

  @Input()
  public viewer: BaseDataSourceViewer = {id: '[rxapIsSelectableValue]'};

  constructor(
    @Inject(DataSourceLoader)
    protected readonly dataSourceLoader: DataSourceLoader,
    @Inject(INJECTOR)
    protected readonly injector: Injector,
  ) {
  }

  public validate(control: AbstractControl): ValidationErrors | null {
    if (control.value) {
      this.extractOptionsDatasource(control);
      const data = this.useDataSourceValue?.lastValue;
      if (data) {
        let options: ControlOptions;
        if (Array.isArray(data)) {
          options = data;
        } else {
          options = Object.entries(data).map(([value, display]) => ({value, display}));
        }
        if (!options.some(option => option.value === control.value)) {
          return {
            isSelectableValue: {
              expected: 'Value should be from the list of provided options',
            },
          };
        }
      } else if (isDevMode()) {
        console.warn('The last value from the OptionsDataSource is empty', this);
      }
    }
    return null;
  }

}


