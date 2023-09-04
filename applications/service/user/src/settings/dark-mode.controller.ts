import {
  Controller,
  Get,
  Inject,
  Logger,
  Put,
} from '@nestjs/common';
import { UserSub } from '@rxap/nest-jwt';
import { UserSettings } from './settings';
import { SettingsService } from './settings.service';

@Controller('settings/dark-mode')
export class DarkModeController {

  @Inject(SettingsService)
  private readonly userSettings: SettingsService;

  @Inject(Logger)
  private readonly logger: Logger;

  @Put('toggle')
  public async toggle(
    @UserSub() userId: string,
  ): Promise<UserSettings> {
    this.logger.verbose(`toggle dark mode for user '${ userId }'`, 'DarkModeController');
    const settings = await this.userSettings.get(userId);
    if (settings.darkMode) {
      return this.disable(userId);
    } else {
      return this.enable(userId);
    }
  }

  @Put('enable')
  public async enable(
    @UserSub() userId: string,
  ): Promise<UserSettings> {
    const settings = await this.userSettings.get(userId);
    settings.darkMode = true;
    await this.userSettings.set(userId, settings);
    this.logger.verbose(`enable dark mode for user '${ userId }'`, 'DarkModeController');
    return this.userSettings.get(userId);
  }

  @Put('disable')
  public async disable(
    @UserSub() userId: string,
  ): Promise<UserSettings> {
    const settings = await this.userSettings.get(userId);
    settings.darkMode = false;
    await this.userSettings.set(userId, settings);
    this.logger.verbose(`disable dark mode for user '${ userId }'`, 'DarkModeController');
    return this.userSettings.get(userId);
  }

  @Get()
  public async get(
    @UserSub() userId: string,
  ): Promise<boolean> {
    const settings = await this.userSettings.get(userId);
    return settings.darkMode;
  }

}
