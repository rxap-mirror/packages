import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';

/**
 * UUID Data Transfer Object class.
 */
export class UuidDto {

  @Expose()
  @IsUUID()
  uuid!: string;

}
