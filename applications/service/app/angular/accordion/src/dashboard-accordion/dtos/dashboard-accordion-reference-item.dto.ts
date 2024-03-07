import {
  Expose,
  Type,
} from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInstance,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class DashboardAccordionReferenceItemDto {
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
  @Type(() => DashboardAccordionReferenceItemDto)
  @IsInstance(DashboardAccordionReferenceItemDto, {
        each: true
      })
  @IsOptional()
  children?: Array<DashboardAccordionReferenceItemDto>;
  @Expose()
  @IsUUID()
  uuid!: string;
}
