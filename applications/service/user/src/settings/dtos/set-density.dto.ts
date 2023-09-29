import { Expose } from 'class-transformer';
import {
  IsNumber,
  Max,
  Min,
} from 'class-validator';

export class SetDensityDto {

  @Expose()
  @IsNumber()
  @Min(-3)
  @Max(0)
  value!: number;

}
