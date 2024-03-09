import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { ToDtoInstanceList } from '@rxap/nest-dto';
import {
  FilterQuery,
  FilterQueryPipe,
} from '@rxap/nest-utilities';
import { DashboardAccordionReferenceItemDto } from './dtos/dashboard-accordion-reference-item.dto';
import { DashboardAccordionReferenceScopeTypeControlOptionsDto } from './dtos/dashboard-accordion-reference-scope-type-control-options.dto';

@Controller('dashboard-accordion/:uuid/reference')
export class DashboardAccordionReferenceController {
  @Get('control/scope-type/options')
  public async getScopeTypeOptions(): Promise<DashboardAccordionReferenceScopeTypeControlOptionsDto[]> {
    return ToDtoInstanceList(
    DashboardAccordionReferenceScopeTypeControlOptionsDto,
    [],
    );
  }

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
        isArray: true
      })
  public async getRoot(@Param('uuid') uuid: string, @Query('pageIndex', new DefaultValuePipe(0)) pageIndex: number, @Query('pageSize', new DefaultValuePipe(5)) pageSize: number, @Query('sortDirection', new DefaultValuePipe('desc')) sortDirection: string, @Query('sortBy', new DefaultValuePipe('__updatedAt')) sortBy: string, @Query('filter', new FilterQueryPipe()) filter: Array<FilterQuery>): Promise<DashboardAccordionReferenceItemDto[]> {
    return ToDtoInstanceList(
    DashboardAccordionReferenceItemDto,
    [],
    );
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
        isArray: true
      })
  public async getChildren(@Param('uuid') uuid: string, @Query('pageIndex', new DefaultValuePipe(0)) pageIndex: number, @Query('pageSize', new DefaultValuePipe(5)) pageSize: number, @Query('sortDirection', new DefaultValuePipe('desc')) sortDirection: string, @Query('sortBy', new DefaultValuePipe('__updatedAt')) sortBy: string, @Query('filter', new FilterQueryPipe()) filter: Array<FilterQuery>, @Param('parentUuid') parentUuid: string): Promise<DashboardAccordionReferenceItemDto[]> {
    return ToDtoInstanceList(
    DashboardAccordionReferenceItemDto,
    [],
    );
  }
}
