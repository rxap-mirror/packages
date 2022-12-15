import { NgModule } from '@angular/core';
import { PromptUpdateComponent } from './prompt-update.component';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { PromptUpdateService } from './prompt-update.service';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';


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
