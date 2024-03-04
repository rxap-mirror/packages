import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  ForFormArrayItemsDirective,
  FormArrayAddItemButtonDirective,
  FormArrayItemRemoveButtonDirective,
  FormArrayItemRestoreButtonDirective,
  FormArrayRemovableDirective,
  InputSelectOptionsDirective,
} from '@rxap/form-system';
import { RxapFormsModule } from '@rxap/forms';
import {
  FormControlsComponent,
  InputClearButtonDirective,
} from '@rxap/material-form-system';
import {
  FormComponentProviders,
  FormProviders,
} from './form.providers';

@Component({
    standalone: true,
    selector: 'rxap-complex-form',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './complex-form.component.html',
    styleUrls: ['./complex-form.component.scss'],
  imports: [ReactiveFormsModule, FormControlsComponent, RxapFormsModule, MatInputModule, MatIconModule, MatButtonModule, InputClearButtonDirective, ForFormArrayItemsDirective, FormArrayRemovableDirective, FormArrayItemRemoveButtonDirective, FormArrayItemRestoreButtonDirective, FormArrayAddItemButtonDirective, MatCheckboxModule, MatSelectModule, InputSelectOptionsDirective],
  providers: [FormProviders, FormComponentProviders],
})
export class ComplexFormComponent {
}

export default ComplexFormComponent;
