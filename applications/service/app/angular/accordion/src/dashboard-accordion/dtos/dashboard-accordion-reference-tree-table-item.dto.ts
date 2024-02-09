import { Expose, Type } from 'class-transformer';
import { IsUUID, IsBoolean, IsArray, IsInstance, IsOptional } from 'class-validator';

export class DashboardAccordionReferenceTreeTableItemDto {
  @Expose()
  @IsUUID()
  uuid!: string;
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
