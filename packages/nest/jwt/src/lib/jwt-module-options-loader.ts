import {
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  JwtModuleOptions,
  JwtOptionsFactory,
} from '@nestjs/jwt';

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
