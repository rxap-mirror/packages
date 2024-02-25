import {
  Controller,
  DefaultValuePipe,
  Get,
  Query,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import {
  classTransformOptions,
  FilterQuery,
  FilterQueryPipe,
} from '@rxap/nest-utilities';
import { plainToInstance } from 'class-transformer';
import { LocationTableSelectPageDto } from './dtos/location-table-select-page.dto';
import { LocationTableSelectRowDto } from './dtos/location-table-select-row.dto';

@Controller('dashboard-accordion/general-information-dashboard')
export class DashboardAccordionGeneralInformationDashboardController {
  private locationListCommand!: any;

  public async getPageData(sortBy: string, sortDirection: string, pageSize: number, pageIndex: number, filter: FilterQuery[]): Promise<{ list: RawRowData[], total: number }> {
    const response = await this.locationListCommand.execute({
          parameters: {
            page: pageIndex,
            size: pageSize,
            sort: sortBy,
            order: sortDirection,
            filter: filter.map((item) => `${ item.column }:${ item.filter }`).join(';'),
          },
        });
    return {
      list: response.entities ?? [],
      total: response.maxCount ?? 0,
    };
  }

  private toRowDto(item: RawRowData, index: number, pageIndex: number, pageSize: number, list: RawRowData[]): LocationTableSelectRowDto {
    return {
      __rowId: item.uuid,

    __value: item.uuid,
      __display: item.name,
      name: item.name,
      uuid: item.uuid
    };
  }

  private toPageDto(list: RawRowData[], total: number, pageIndex: number, pageSize: number, sortBy: string, sortDirection: string, filter: FilterQuery[]): LocationTableSelectPageDto {
    return {
      total, pageIndex, pageSize, sortBy, sortDirection, filter,
      rows: list.map((item, index) => this.toRowDto(item, index, pageIndex, pageSize, list))
    };
  }

  @Get('control/location/table-select/page')
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
  public async getLocationControlTableSelectPage(@Query('filter', new FilterQueryPipe()) filter: FilterQuery[], @Query('sortBy', new DefaultValuePipe('__updatedAt')) sortBy: string, @Query('sortDirection', new DefaultValuePipe('desc')) sortDirection: string, @Query('pageSize', new DefaultValuePipe(5)) pageSize: number, @Query('pageIndex', new DefaultValuePipe(0)) pageIndex: number): Promise<LocationTableSelectPageDto> {
    const data = await this.getPageData(sortBy, sortDirection, pageSize, pageIndex, filter);
    return plainToInstance(
      LocationTableSelectPageDto,
      this.toPageDto(data.list, data.total, pageIndex, pageSize, sortBy, sortDirection, filter),
      classTransformOptions
    );
  }
}

type RawRowData = any;
