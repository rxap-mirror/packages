import {
  addDecorator,
  moduleMetadata,
} from '@storybook/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormSystemControlDirective } from './form-system-control.directive';
import { UseComponent } from './decorators/use-component';
import { UseDataSource } from './decorators/use-data-source';
import { ControlWithDataSource } from './control-with-data-source';
import {
  Component,
  Injectable,
  Injector,
  INJECTOR,
  Input,
} from '@angular/core';
import {
  BaseDataSource,
  RxapStaticDataSource,
  StaticDataSource,
} from '@rxap/data-source';
import { Required } from '@rxap/utilities';
import {
  ControlValueAccessor,
  FormDefinition,
  RXAP_FORM_DEFINITION,
  RxapForm,
  RxapFormBuilder,
  RxapFormControl,
  RxapFormGroup,
  RxapFormsModule,
  UseFormControl,
} from '@rxap/forms';
import { DataSourceCollectionDirective } from '@rxap/data-source/directive';
import { FormsModule } from '@angular/forms';

@Component({
  template: `
                <label>{{label}}</label>
                <select [ngModel]="value" (ngModelChange)="onChange($event)">
                  <option
                    *rxapDataSourceCollection="let option from optionsDataSource"
                    [value]="option">
                    {{option}}
                  </option>
                </select>
              `,
  standalone: true,
  imports: [ FormsModule, DataSourceCollectionDirective ],
})
class SelectControlComponent extends ControlValueAccessor implements ControlWithDataSource {

  @Input()
  @Required
  public label!: string;

  @Required
  public optionsDataSource!: BaseDataSource;

  public value: any;

  public setDataSource(name: string, dataSource: BaseDataSource): void {
    switch (name) {

      case 'options':
        this.optionsDataSource = dataSource;
        break;

      default:
        throw new Error(`Unsupported data source '${ name }'`);

    }
  }

  public writeValue(obj: any): void {
    this.value = obj;
  }

}


@RxapStaticDataSource({
  id: 'cars',
  data: [
    'Tesla Model X',
    'Ford Focus',
    'Mercedes Benz',
  ],
})
@Injectable()
class CarDataSource extends StaticDataSource<string[]> {
}

@RxapForm('test')
class TestForm implements FormDefinition {

  public rxapFormGroup!: RxapFormGroup;

  @UseDataSource(CarDataSource, 'options')
  @UseComponent(SelectControlComponent, {
    label: 'custom select label',
  })
  @UseFormControl()
  public cars!: RxapFormControl;

}

addDecorator(moduleMetadata({
  imports: [
    FormSystemModule,
    RxapFormsModule,
    BrowserAnimationsModule,
  ],
  providers: [
    CarDataSource,
    TestForm,
    {
      provide: RXAP_FORM_DEFINITION,
      useFactory: (injector: Injector) => new RxapFormBuilder(TestForm, injector).build(),
      deps: [ INJECTOR ],
    },
  ],
}));

export default {
  title: 'FormSystemControlDirective',
  component: FormSystemControlDirective,
};

export const basic = () => ({
  styles: [
    `

  form {
    padding: 15px;
  }

  `,
  ],
  template: `

<form rxapForm novalidate>

  <ng-container rxapFormSystemControl controlId="cars"></ng-container>

</form>

  `,
});
