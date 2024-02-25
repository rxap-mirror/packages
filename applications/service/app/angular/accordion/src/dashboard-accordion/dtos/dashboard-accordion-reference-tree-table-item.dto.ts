import { Expose, Type } from 'class-transformer';
import { IsBoolean, IsString, IsArray, IsInstance, IsOptional } from 'class-validator';

export class DashboardAccordionReferenceTreeTableItemDto {
  @Expose()
  @IsBoolean()
  referenced!: boolean;
  @Expose()
  @IsString()
  name!: string;
  @Expose()
  @IsString()
  type!: string;
  @Expose()
  @IsBoolean()
  hasChildren!: boolean;
  @Expose()
  @IsArray()
  @Type(() => DashboardAccordionReferenceTreeTableItemDto)
  @IsInstance(DashboardAccordionReferenceTreeTableItemDto, {
        each: true
      })
  @IsOptional()
  children?: Array<DashboardAccordionReferenceTreeTableItemDto>;
}
