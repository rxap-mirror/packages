import { NgModule } from '@angular/core';
import { CheckboxControlComponent } from './checkbox-control.component';
import { MatCheckboxModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations:    [ CheckboxControlComponent ],
  imports:         [
    MatCheckboxModule,
    TranslateModule.forChild(),
    FormsModule
  ],
  exports:         [ CheckboxControlComponent ],
  entryComponents: [ CheckboxControlComponent ]
})
export class CheckboxControlComponentModule {}
