import {
  Logger,
  Module,
} from '@nestjs/common';
import { DarkModeController } from './dark-mode.controller';
import { LanguageController } from './language.controller';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  controllers: [
    DarkModeController,
    LanguageController,
    SettingsController,
  ],
  providers: [
    SettingsService,
    Logger,
  ],
})
export class SettingsModule {}
