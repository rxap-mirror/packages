import { Expose } from 'class-transformer';
import {
  IsNumber,
  IsString,
} from 'class-validator';

export class DashboardAccordionReferenceScopeTypeControlOptionsDto {
  @Expose()
  @IsString()
  display!: string;
  @Expose()
  @IsNumber()
  value!: number;
}
