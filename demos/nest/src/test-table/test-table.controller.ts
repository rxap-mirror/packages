import { Controller, DefaultValuePipe, Get, Query } from '@nestjs/common';
import { TestTableRowDto } from './dtos/test-table-row.dto';
import { TestTablePageDto } from './dtos/test-table-page.dto';
import { ToDtoInstance } from '@rxap/nest-dto';
import { FilterQuery, FilterQueryPipe } from '@rxap/nest-utilities';
import { ApiQuery } from '@nestjs/swagger';

@Controller('test-table')
export class TestTableController {
  public async getPageData(
    sortBy: string,
    sortDirection: string,
    pageSize: number,
    pageIndex: number,
    filter: FilterQuery[],
  ): Promise<{
    list: Array<RawRowData>;
    total: number;
  }> {
    return {
      list: [],
      total: 0,
    };
  }

  private toRowDto(
    item: RawRowData,
    index: number,
    pageIndex: number,
    pageSize: number,
    list: Array<RawRowData>,
  ): TestTableRowDto {
    return {
      __rowId: pageIndex * pageSize + index,

      name: item.name,
      description: item.description,
    };
  }

  private toPageDto(
    list: Array<RawRowData>,
    total: number,
    pageIndex: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    filter: FilterQuery[],
  ): TestTablePageDto {
    return {
      total,
      pageIndex,
      pageSize,
      sortBy,
      sortDirection,
      filter,
      rows: list.map((item, index) =>
        this.toRowDto(item, index, pageIndex, pageSize, list),
      ),
    };
  }

  @Get()
  @ApiQuery({
    name: 'pageIndex',
    required: false,
    isArray: false,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    isArray: false,
  })
  @ApiQuery({
    name: 'sortDirection',
    required: false,
    isArray: false,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    isArray: false,
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    isArray: true,
  })
  public async getPage(
    @Query('filter', new FilterQueryPipe()) filter: Array<FilterQuery>,
    @Query('pageIndex', new DefaultValuePipe(0)) pageIndex: number,
    @Query('pageSize', new DefaultValuePipe(5)) pageSize: number,
    @Query('sortBy', new DefaultValuePipe('__updatedAt')) sortBy: string,
    @Query('sortDirection', new DefaultValuePipe('desc')) sortDirection: string,
  ): Promise<TestTablePageDto> {
    const data = await this.getPageData(
      sortBy,
      sortDirection,
      pageSize,
      pageIndex,
      filter,
    );
    return ToDtoInstance(
      TestTablePageDto,
      this.toPageDto(
        data.list,
        data.total,
        pageIndex,
        pageSize,
        sortBy,
        sortDirection,
        filter,
      ),
    );
  }
}

type RawRowData = any;
