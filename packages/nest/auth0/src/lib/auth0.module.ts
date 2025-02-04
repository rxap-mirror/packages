import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Module,
} from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { Auth0Service } from './auth0.service';
import { JwtStrategy } from './jwt.strategy';
import { AUTH0_OPTIONS } from './tokens';
import { AuthenticationClientOptions } from 'auth0';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<AuthenticationClientOptions>()
  .build();

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [JwtStrategy],
  exports: [PassportModule],
})
export class Auth0Module extends ConfigurableModuleClass {

  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    return this.updateProviders(super.register(options));
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return this.updateProviders(super.registerAsync(options));
  }

  private static updateProviders(module: DynamicModule) {
    module.providers ??= [];
    module.providers.push(Auth0Service);
    module.exports ??= [];
    module.exports.push(Auth0Service);
    module.providers.push({
      provide: AUTH0_OPTIONS,
      useExisting: MODULE_OPTIONS_TOKEN
    });
    return module;
  }

}
