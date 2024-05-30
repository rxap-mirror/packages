import { Expose } from 'class-transformer';
import {
  IsString,
  IsUUID,
} from 'class-validator';

/** Represents a UUID object data transfer object.
 * @class
 */
export class UuidObjectDto {
  @Expose()
  @IsUUID()
  uuid!: string;

  @Expose()
  @IsString()
  name!: string;
}
