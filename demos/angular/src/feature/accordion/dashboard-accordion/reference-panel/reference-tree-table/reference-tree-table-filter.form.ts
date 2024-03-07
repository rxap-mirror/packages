import { Injectable } from '@angular/core';
import { UseOptionsMethod } from '@rxap/form-system';
import {
  FormType,
  RxapForm,
  RxapFormControl,
  RxapFormGroup,
  UseFormControl,
} from '@rxap/forms';
import { DashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethod } from 'open-api-service-app-angular-accordion/remote-methods/dashboard-accordion-reference-controller-get-scope-type-options.remote-method';
import { IReferenceTreeTable } from './reference-tree-table';

@RxapForm('reference-tree-table-filter')
@Injectable()
export class ReferenceTreeTableFilterForm implements FormType<IReferenceTreeTableFilterForm> {
  public readonly rxapFormGroup!: RxapFormGroup<IReferenceTreeTableFilterForm>;
  @UseFormControl()
  public readonly isReferenced!: RxapFormControl<boolean>;
  @UseFormControl()
  public readonly name!: RxapFormControl<string>;

  @UseOptionsMethod(DashboardAccordionReferenceControllerGetScopeTypeOptionsRemoteMethod)
  @UseFormControl()
  public readonly scopeType!: RxapFormControl<number>;
}

export type IReferenceTreeTableFilterForm = Pick<IReferenceTreeTable, 'isReferenced' | 'name' | 'scopeType'>;
