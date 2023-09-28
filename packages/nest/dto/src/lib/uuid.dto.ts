import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class UuidDto {

  @Expose()
  @IsUUID()
  uuid!: string;

}
