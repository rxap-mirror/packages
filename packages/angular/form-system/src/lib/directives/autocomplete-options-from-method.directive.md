Autocomplete Table Select
====

# With Rxap form System

```angular2html

<mat-form-field>
  <mat-label>Company</mat-label>
  <input type="text"
         placeholder="Enter Company Name"
         matInput
         formControlName="company"
         [matAutocomplete]="auto">
  <!-- The autocomplete input -->
  <mat-autocomplete #auto="matAutocomplete">
    <mat-option *rxapAutocompleteOptionsFromMethod="let option; matAutocomplete: auto"
                [value]="option.value">{{ option.display }}
    </mat-option>
  </mat-autocomplete>
  <button mat-icon-button rxapInputClearButton matSuffix>
    <mat-icon>clear</mat-icon>
  </button>
</mat-form-field>
```

```typescript
@Injectable()
@RxapForm('form')
export class Form {

  // ensure the table data source is provided - in root or in the form component
  @UseAutocompleteOptionsMethod(SearchCompanyMethod)
  // ensure the table data source is provided - in root or in the form component
  @UseAutocompleteResolveMethod(GetCompanyMethod)
  @UseFormControl()
  company!: RxapFromControl<Company>;

}
```

The DataSource `CompanyGuiTableDataSource` is used to populate the table in the selection window. Ensure that this DataSource is of the type `AbstractTableDataSource`.

The Method `SearchCompanyMethod` is used by the autocomplete control to search for a list of matching selection options. The Method must accept a string as the first argument and return a list of `ControlOption` objects.

The Method `GetCompanyMethod` is used to resolve the selected value. The Method must accept a the value of the form control as the first argument and return a `ControlOption` object.

```typescript
export class SearchCompanyMethod implements Method<ControlOptions, { parameters: { search?: string | null } }> { ... }
export class GetCompanyMethod implements Method<ControlOption, { parameters: { value: string } }> { ... }
```

# Method Parameter Adopter

By default the following adopter function is used by the `@UseAutocompleteOptionsMethod` and `@UseAutocompleteResolveMethod` decorators.

```typescript
(parameters) => ({parameters})
```

To override this default adopter function use the second argument of the decorator.

```typescript
@UseAutocompleteOptionsMethod(SearchCompanyMethod, { adapter: { parameter: (parameters) => ({ search: parameters.search }) } })
```

> The adapter function are called in an injection context, so it is possible to use the `inject` function

