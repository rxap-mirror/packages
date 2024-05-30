import {
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  JwtModuleOptions,
  JwtOptionsFactory,
} from '@nestjs/jwt';

/**
 * Injectable class that implements `JwtOptionsFactory`.
 * It is responsible for creating JWT module options by getting the secret from the `ConfigService`.
 */
@Injectable()
export class JwtModuleOptionsLoader implements JwtOptionsFactory {

  @Inject(ConfigService)
  private readonly config!: ConfigService;

  createJwtOptions(): JwtModuleOptions {
    return {
      global: true,
      secret: this.config.getOrThrow('JWT_SECRET'),
    };
  }

}
