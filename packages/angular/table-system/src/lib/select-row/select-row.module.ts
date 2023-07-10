import { NgModule } from '@angular/core';
import { SelectRowService } from './select-row.service';


import { AllRowsSelectedDirective } from './all-rows-selected.directive';


@NgModule({
  imports: [ AllRowsSelectedDirective ],
  exports: [
    AllRowsSelectedDirective,
  ],
  providers: [SelectRowService],
})
export class SelectRowModule {
}
