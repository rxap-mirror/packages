import { Expose } from 'class-transformer';
import {
  IsString,
  IsUrl,
} from 'class-validator';

export class RegisterDto {

  @Expose()
  @IsString()
  name!: string;

  @Expose()
  @IsUrl({
    require_tld: false,
  })
  url!: string;

}
