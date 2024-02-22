import { Expose, Type } from 'class-transformer';
import { IsUUID, IsBoolean, IsArray, IsInstance, IsOptional, IsString } from 'class-validator';

export class DashboardAccordionReferenceTreeTableItemDto {
  @Expose()
  @IsUUID()
  uuid!: string;
  @Expose()
  @IsBoolean()
  hasChildren!: boolean;

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
  @IsArray()
  @Type(() => DashboardAccordionReferenceTreeTableItemDto)
  @IsInstance(DashboardAccordionReferenceTreeTableItemDto, {
        each: true
      })
  @IsOptional()
  children?: Array<DashboardAccordionReferenceTreeTableItemDto>;
}
