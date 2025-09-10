import { Expose } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export class ExistsDto {

  @Expose()
  @IsBoolean()
  exists!: boolean;

}
