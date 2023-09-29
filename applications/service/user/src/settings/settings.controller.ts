import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Inject,
  Param,
  ParseBoolPipe,
  ParseFloatPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
} from '@nestjs/swagger';
import { UserSub } from '@rxap/nest-jwt';
import {
  equals,
  GetFromObjectFactory,
  RemoveFromObject,
  SetToObject,
} from '@rxap/utilities';
import { Request } from 'express';
import { UserSettings } from './settings';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {

  @Inject(SettingsService)
  private readonly userSettings: SettingsService;

  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        darkMode: {
          type: 'boolean',
        },
        language: {
          type: 'string',
        },
        theme: {
          type: 'object',
          properties: {
            preset: {
              type: 'string',
            },
            density: {
              type: 'number',
              enum: [ 0, -1, -2, -3 ],
            },
            typography: {
              type: 'string',
            },
          },
          additionalProperties: true,
          required: [ 'preset' ],
        },
      },
      additionalProperties: true,
      required: [ 'darkMode', 'language', 'theme' ],
    },
  })
  @Get()
  public get(
    @UserSub() userId: string,
    @Req() request: Request,
  ): Promise<UserSettings> {
    return this.userSettings.get(userId, this.buildDefaultSettingsFromRequest(request));
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        darkMode: {
          type: 'boolean',
        },
        language: {
          type: 'string',
        },
        theme: {
          type: 'object',
          properties: {
            preset: {
              type: 'string',
            },
            density: {
              type: 'number',
              enum: [ 0, -1, -2, -3 ],
            },
            typography: {
              type: 'string',
            },
          },
          additionalProperties: true,
          required: [ 'preset' ],
        },
      },
      additionalProperties: true,
      required: [ 'darkMode', 'language', 'theme' ],
    },
  })
  @Post()
  public async set(
    @UserSub() userId: string,
    @Body() settings: UserSettings,
  ): Promise<void> {
    await this.userSettings.set(userId, settings);
  }

  @Put(':propertyPath/toggle')
  public async toggleProperty(
    @UserSub() userId: string,
    @Param('propertyPath') propertyPath: string,
    @Req() request: Request,
  ): Promise<void> {
    const settings = await this.userSettings.get(userId, this.buildDefaultSettingsFromRequest(request));
    const value = GetFromObjectFactory(propertyPath, false)(settings);
    if (typeof value !== 'boolean') {
      throw new BadRequestException(`The user settings property '${ propertyPath }' is not a boolean value`);
    }
    SetToObject(settings, propertyPath, !value);
    await this.userSettings.set(userId, settings);
  }

  @ApiOkResponse({
    schema: {},
  })
  @Get(':propertyPath')
  public async getProperty(
    @UserSub() userId: string,
    @Param('propertyPath') propertyPath: string,
    @Req() request: Request,
  ): Promise<unknown> {
    const settings = await this.userSettings.get(userId, this.buildDefaultSettingsFromRequest(request));
    return GetFromObjectFactory(propertyPath, propertyPath)(settings);
  }

  @Put(':propertyPath')
  public async setProperty(
    @UserSub() userId: string,
    @Body() value: any,
    @Param('propertyPath') propertyPath: string,
    @Req() request: Request,
  ): Promise<void> {
    const settings = await this.userSettings.get(userId, this.buildDefaultSettingsFromRequest(request));
    SetToObject(settings, propertyPath, value);
    await this.userSettings.set(userId, settings);
  }

  @Delete(':propertyPath')
  public async clearProperty(
    @UserSub() userId: string,
    @Param('propertyPath') propertyPath: string,
    @Req() request: Request,
  ): Promise<void> {
    const settings = await this.userSettings.get(userId, this.buildDefaultSettingsFromRequest(request));
    RemoveFromObject(settings, propertyPath);
    await this.userSettings.set(userId, settings);
  }

  @Put(':propertyPath/push')
  public async pushProperty(
    @UserSub() userId: string,
    @Param('propertyPath') propertyPath: string,
    @Body() value: any,
    @Req() request: Request,
  ): Promise<void> {
    const settings = await this.userSettings.get(userId, this.buildDefaultSettingsFromRequest(request));
    let array = GetFromObjectFactory(propertyPath)(settings);
    if (array === undefined) {
      array = [];
      SetToObject(settings, propertyPath, array);
    }
    if (!Array.isArray(array)) {
      throw new BadRequestException(`The user settings property '${ propertyPath }' is not an array`);
    }
    array.push(value);
    await this.userSettings.set(userId, settings);
  }

  @ApiOkResponse({
    schema: {},
  })
  @Delete(':propertyPath/pop')
  public async popProperty(
    @UserSub() userId: string,
    @Param('propertyPath') propertyPath: string,
    @Req() request: Request,
  ): Promise<unknown> {
    const settings = await this.userSettings.get(userId, this.buildDefaultSettingsFromRequest(request));
    const array = GetFromObjectFactory(propertyPath, [])(settings);
    if (!Array.isArray(array)) {
      throw new BadRequestException(`The user settings property '${ propertyPath }' is not an array`);
    }
    const value = array.pop();
    await this.userSettings.set(userId, settings);
    return value;
  }

  @Put(':propertyPath/unshift')
  public async unshiftProperty(
    @UserSub() userId: string,
    @Param('propertyPath') propertyPath: string,
    @Body() value: any,
    @Req() request: Request,
  ): Promise<number> {
    const settings = await this.userSettings.get(userId, this.buildDefaultSettingsFromRequest(request));
    const array = GetFromObjectFactory(propertyPath, [])(settings);
    if (!Array.isArray(array)) {
      throw new BadRequestException(`The user settings property '${ propertyPath }' is not an array`);
    }
    const index = array.unshift(value);
    await this.userSettings.set(userId, settings);
    return index;
  }

  @ApiOkResponse({
    schema: {},
  })
  @Delete(':propertyPath/shift')
  public async shiftProperty(
    @UserSub() userId: string,
    @Param('propertyPath') propertyPath: string,
    @Req() request: Request,
  ): Promise<unknown> {
    const settings = await this.userSettings.get(userId, this.buildDefaultSettingsFromRequest(request));
    const array = GetFromObjectFactory(propertyPath, [])(settings);
    if (!Array.isArray(array)) {
      throw new BadRequestException(`The user settings property '${ propertyPath }' is not an array`);
    }
    const value = array.shift();
    await this.userSettings.set(userId, settings);
    return value;
  }

  @Delete(':propertyPath/removeAt/:index')
  public async removeAtProperty(
    @UserSub() userId: string,
    @Param('propertyPath') propertyPath: string,
    @Param('index', ParseIntPipe) index: number,
    @Req() request: Request,
  ): Promise<void> {
    const settings = await this.userSettings.get(userId, this.buildDefaultSettingsFromRequest(request));
    const array = GetFromObjectFactory(propertyPath, [])(settings);
    if (!Array.isArray(array)) {
      throw new BadRequestException(`The user settings property '${ propertyPath }' is not an array`);
    }
    if (array[index] === undefined) {
      throw new BadRequestException(`The user settings property '${ propertyPath }' has no value at index ${ index }`);
    }
    SetToObject(settings, propertyPath, array.splice(index, 1));
    await this.userSettings.set(userId, settings);
  }

  @Delete(':propertyPath/remove')
  public async removeProperty(
    @UserSub() userId: string,
    @Param('propertyPath') propertyPath: string,
    @Body() value: any,
    @Query('optional', new DefaultValuePipe(false), ParseBoolPipe) optional = false,
    @Req() request: Request,
  ): Promise<void> {
    const settings = await this.userSettings.get(userId, this.buildDefaultSettingsFromRequest(request));
    const array = GetFromObjectFactory(propertyPath, [])(settings);
    if (!Array.isArray(array)) {
      throw new BadRequestException(`The user settings property '${ propertyPath }' is not an array`);
    }
    const index = array.findIndex(item => equals(item, value));
    if (array[index] === undefined) {
      if (!optional) {
        throw new BadRequestException(`The user settings property '${ propertyPath }' has no matching value`);
      }
    }
    SetToObject(settings, propertyPath, array.splice(index, 1));
    await this.userSettings.set(userId, settings);
  }

  @Put(':propertyPath/increment')
  public async incrementProperty(
    @UserSub() userId: string,
    @Param('propertyPath') propertyPath: string,
    @Query('value', new DefaultValuePipe(1), ParseFloatPipe) value = 1,
    @Req() request: Request,
  ): Promise<void> {
    const settings = await this.userSettings.get(userId, this.buildDefaultSettingsFromRequest(request));
    const currentValue = GetFromObjectFactory(propertyPath, 0)(settings);
    if (typeof currentValue !== 'number') {
      throw new BadRequestException(`The user settings property '${ propertyPath }' is not a number`);
    }
    SetToObject(settings, propertyPath, currentValue + value);
    await this.userSettings.set(userId, settings);
  }

  @Put(':propertyPath/decrement')
  public async decrementProperty(
    @UserSub() userId: string,
    @Param('propertyPath') propertyPath: string,
    @Query('value', new DefaultValuePipe(1), ParseFloatPipe) value = 1,
    @Req() request: Request,
  ): Promise<void> {
    const settings = await this.userSettings.get(userId, this.buildDefaultSettingsFromRequest(request));
    const currentValue = GetFromObjectFactory(propertyPath, 0)(settings);
    if (typeof currentValue !== 'number') {
      throw new BadRequestException(`The user settings property '${ propertyPath }' is not a number`);
    }
    SetToObject(settings, propertyPath, currentValue - value);
    await this.userSettings.set(userId, settings);
  }

  private buildDefaultSettingsFromRequest(request: Request): Partial<UserSettings> {
    const settings: Partial<UserSettings> = {};

    if (request.acceptsLanguages().length) {
      settings.language = request.acceptsLanguages()[0].replace(/-.+/, '');
    }

    return settings;
  }

}
