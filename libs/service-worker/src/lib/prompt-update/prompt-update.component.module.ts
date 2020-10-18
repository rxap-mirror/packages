import { NgModule } from '@angular/core';
import { PromptUpdateComponent } from './prompt-update.component';
import { MatDialogModule } from '@angular/material/dialog';
import { PromptUpdateService } from './prompt-update.service';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';


@NgModule({
  declarations:    [ PromptUpdateComponent ],
  imports:         [
    MatDialogModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  exports:         [ PromptUpdateComponent ]
})
export class PromptUpdateModule {

  constructor(promptUpdate: PromptUpdateService) {
    promptUpdate.start();
  }

}
