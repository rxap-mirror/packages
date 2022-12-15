import { NgModule } from '@angular/core';
import { TableShowArchivedSlideComponent } from './table-show-archived-slide.component';
import { StopPropagationDirectiveModule } from '@rxap/directives';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';


@NgModule({
  declarations: [TableShowArchivedSlideComponent],
  imports: [
    StopPropagationDirectiveModule,
    MatSlideToggleModule,
  ],
  exports: [TableShowArchivedSlideComponent],
})
export class TableShowArchivedSlideComponentModule {
}
