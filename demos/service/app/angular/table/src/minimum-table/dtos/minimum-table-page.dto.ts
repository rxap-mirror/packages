import { PageDto } from '@rxap/nest-utilities';
import { MinimumTableRowDto } from './minimum-table-row.dto';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsInstance } from 'class-validator';

export class MinimumTablePageDto extends PageDto<MinimumTableRowDto> {
  @Expose()
  @IsArray()
  @Type(() => MinimumTableRowDto)
  @IsInstance(MinimumTableRowDto, {
        each: true
      })
  rows!: Array<MinimumTableRowDto>;
}
