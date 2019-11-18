import { NgModule } from '@angular/core';
import { SanitizerPipe } from './sanitizer.pipe';

@NgModule({
  exports:      [ SanitizerPipe ],
  declarations: [ SanitizerPipe ]
})
export class SanitizerPipeModule {}
