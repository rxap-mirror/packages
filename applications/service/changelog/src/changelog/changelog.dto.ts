import { Expose } from 'class-transformer';
import {
  IsArray,
  IsString,
} from 'class-validator';

export class ChangelogDto {

  @Expose()
  @IsString()
  @IsArray()
  general: string[];

  @Expose()
  @IsString()
  @IsArray()
  application: string[];

}
