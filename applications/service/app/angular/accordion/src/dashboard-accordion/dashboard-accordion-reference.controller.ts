import { Controller, DefaultValuePipe, Get, NotImplementedException, Query, Param } from '@nestjs/common';
import { FilterQuery, FilterQueryPipe } from '@rxap/nest-utilities';
import { DashboardAccordionReferenceItemDto } from './dtos/dashboard-accordion-reference-item.dto';
import { ApiQuery } from '@nestjs/swagger';

@Controller('dashboard-accordion/:uuid/reference')
export class DashboardAccordionReferenceController {
  @Get()
  @ApiQuery({
        name: 'pageIndex',
        required: false,
        isArray: false
      })
  @ApiQuery({
        name: 'pageSize',
        required: false,
        isArray: false
      })
  @ApiQuery({
        name: 'sortDirection',
        required: false,
        isArray: false
      })
  @ApiQuery({
        name: 'sortBy',
        required: false,
        isArray: false
      })
  @ApiQuery({
        name: 'filter',
        required: false,
        isArray: false
      })
  public async getRoot(@Query('filter', new FilterQueryPipe()) filter: FilterQuery[], @Query('sortBy', new DefaultValuePipe('__updatedAt')) sortBy: string, @Query('sortDirection', new DefaultValuePipe('desc')) sortDirection: string, @Query('pageSize', new DefaultValuePipe(5)) pageSize: number, @Query('pageIndex', new DefaultValuePipe(0)) pageIndex: number): Promise<DashboardAccordionReferenceItemDto[]> {
    throw new NotImplementedException();
  }

  @Get(':parentUuid')
  @ApiQuery({
        name: 'pageIndex',
        required: false,
        isArray: false
      })
  @ApiQuery({
        name: 'pageSize',
        required: false,
        isArray: false
      })
  @ApiQuery({
        name: 'sortDirection',
        required: false,
        isArray: false
      })
  @ApiQuery({
        name: 'sortBy',
        required: false,
        isArray: false
      })
  @ApiQuery({
        name: 'filter',
        required: false,
        isArray: false
      })
  public async getChildren(@Param('parentUuid') parentUuid: string, @Query('filter', new FilterQueryPipe()) filter: FilterQuery[], @Query('sortBy', new DefaultValuePipe('__updatedAt')) sortBy: string, @Query('sortDirection', new DefaultValuePipe('desc')) sortDirection: string, @Query('pageSize', new DefaultValuePipe(5)) pageSize: number, @Query('pageIndex', new DefaultValuePipe(0)) pageIndex: number): Promise<DashboardAccordionReferenceItemDto[]> {
    throw new NotImplementedException();
  }
}
