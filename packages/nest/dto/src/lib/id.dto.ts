import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class IdDto {
  @Expose()
  @IsUUID()
  id!: string;
}
