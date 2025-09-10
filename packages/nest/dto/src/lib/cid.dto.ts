import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class CidDto {
  @Expose()
  @IsString()
  cid!: string;

  @Expose()
  @IsString()
  v1!: string;

  @Expose()
  @IsString()
  @IsOptional()
  v0?: string;
}
