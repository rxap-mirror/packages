import { Expose } from 'class-transformer';
import {
  IsOptional,
  IsString,
} from 'class-validator';

export class IconDto {

  @Expose()
  @IsString()
  @IsOptional()
  svgIcon?: string;

  @Expose()
  @IsString()
  @IsOptional()
  color?: string;

  @Expose()
  @IsString()
  @IsOptional()
  fontColor?: string;

}
