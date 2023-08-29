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

}
