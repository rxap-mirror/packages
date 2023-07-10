import { NgModule } from '@angular/core';
import { PromptUpdateComponent } from './prompt-update.component';
import { PromptUpdateService } from './prompt-update.service';


@NgModule({
  imports: [
    PromptUpdateComponent,
  ],
  exports: [ PromptUpdateComponent ],
})
export class PromptUpdateModule {

  constructor(promptUpdate: PromptUpdateService) {
    promptUpdate.start();
  }

}
