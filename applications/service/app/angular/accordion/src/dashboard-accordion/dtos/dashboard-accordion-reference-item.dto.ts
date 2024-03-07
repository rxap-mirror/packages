import { ApiProperty } from '@nestjs/swagger';
import { IconDto } from '@rxap/nest-dto';
import {
  Expose,
  Type,
} from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInstance,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class DashboardAccordionReferenceItemDto {
  @Expose()
  @IsString()
  referenceUuid!: string;
  @Expose()
  @ApiProperty({
        type: 'unknown'
      })
  type!: unknown;
  @Expose()
  @Type(() => IconDto)
  @IsInstance(IconDto, )
  @IsOptional()
  icon?: IconDto;
  @Expose()
  @IsBoolean()
  isReferenced!: boolean;
  @Expose()
  @IsString()
  name!: string;
  @Expose()
  @IsNumber()
  scopeType!: number;
  @Expose()
  @IsUUID()
  uuid!: string;
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
}
