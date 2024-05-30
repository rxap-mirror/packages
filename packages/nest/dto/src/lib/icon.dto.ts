import { Expose } from 'class-transformer';
import {
  IsOptional,
  IsString,
} from 'class-validator';

/**
 * Represents an IconDto object used for storing icon details.
 */
export class IconDto {

  @Expose()
  @IsString()
  @IsOptional()
  svgIcon?: string;

  @Expose()
  @IsString()
  @IsOptional()
  icon?: string;

  @Expose()
  @IsString()
  @IsOptional()
  color?: string;

  @Expose()
  @IsString()
  @IsOptional()
  fontColor?: string;

  @Expose()
  @IsString()
  @IsOptional()
  tooltip?: string;

}
