import {
  Logger,
  Module,
} from '@nestjs/common';
import { DarkModeController } from './dark-mode.controller';
import { LanguageController } from './language.controller';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { ThemeController } from './theme.controller';

@Module({
  controllers: [
    DarkModeController,
    LanguageController,
    SettingsController,
    ThemeController,
  ],
  providers: [
    SettingsService,
    Logger,
  ],
})
export class SettingsModule {}
