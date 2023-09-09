import { Expose } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class RegisterDto {

  @Expose()
  @IsString()
  name!: string;

  @Expose()
  @IsOptional()
  @IsUrl({
    require_tld: false,
  })
  url?: string;

  @Expose()
  @IsOptional()
  @IsNumber()
  port?: number;

  @Expose()
  @IsOptional()
  @IsString()
  healthCheckPath?: string;

  @Expose()
  @IsOptional()
  @IsString()
  domain?: string;

  @Expose()
  @IsOptional()
  @IsString()
  ip?: string;

  @Expose()
  @IsOptional()
  @IsString()
  infoPath?: string;

}
