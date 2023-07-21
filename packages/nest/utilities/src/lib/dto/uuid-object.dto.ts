import { Expose } from 'class-transformer';
import {
  IsString,
  IsUUID,
} from 'class-validator';

export class UuidObjectDto {
  @Expose()
  @IsUUID()
  uuid!: string;

  @Expose()
  @IsString()
  name!: string;
}
