import { Controller, Get, NotImplementedException, Param } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { classTransformOptions } from '@rxap/nest-utilities';
import { DashboardAccordionReferenceTreeTableItemDto } from './dtos/dashboard-accordion-reference-tree-table-item.dto';

@Controller('dashboard-accordion/:uuid/reference-tree-table')
export class DashboardAccordionReferenceTreeTableController {
  @Get()
  public async getRoot(): Promise<DashboardAccordionReferenceTreeTableItemDto[]> {
    throw new NotImplementedException();
  }

  @Get(':parentUuid')
  public async getChildren(@Param('parentUuid') parentUuid: string): Promise<DashboardAccordionReferenceTreeTableItemDto[]> {
    throw new NotImplementedException();
  }
}
