import { faker } from '@faker-js/faker';
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
import { MinimumTablePageDto } from './dtos/minimum-table-page.dto';
import { MinimumTableRowDto } from './dtos/minimum-table-row.dto';

@Controller('minimum-table')
export class MinimumTableController {
  public async getPageData(
    sortBy: string,
    sortDirection: string,
    pageSize: number,
    pageIndex: number,
    filter: FilterQuery[],
  ): Promise<{ list: RawRowData[], total: number }> {
    return {
      list: Array.from({ length: pageSize }, () => ({
        name: faker.person.fullName(),
        age: faker.number.int(),
        isActive: faker.datatype.boolean(),
        email: faker.internet.email(),
        rating: parseFloat(faker.finance.amount(0, 5, 1)),
        accountStatus: faker.helpers.arrayElement([ 'active', 'inactive', 'pending' ]),
      })),
      total: pageSize * 10,
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
    isArray: false,
  })
  public async getPage(
    @Query('sortBy', new DefaultValuePipe('__updatedAt')) sortBy: string,
    @Query('sortDirection', new DefaultValuePipe('desc')) sortDirection: string,
    @Query('pageSize', new DefaultValuePipe(5)) pageSize: number,
    @Query('pageIndex', new DefaultValuePipe(0)) pageIndex: number,
    @Query('filter', new FilterQueryPipe()) filter?: FilterQuery[],
  ): Promise<MinimumTablePageDto> {
    const data = await this.getPageData(sortBy, sortDirection, pageSize, pageIndex, filter);
    return plainToInstance(
      MinimumTablePageDto,
      this.toPageDto(data.list, data.total, pageIndex, pageSize, sortBy, sortDirection, filter),
      classTransformOptions,
    );
  }

  private toRowDto(
    item: RawRowData,
    index: number,
    pageIndex: number,
    pageSize: number,
    list: RawRowData[],
  ): MinimumTableRowDto {
    return {
      __rowId: item.uuid,

      name: item.name,
      age: item.age,
      isActive: item.isActive,
      email: item.email,
      rating: item.rating,
      accountStatus: item.accountStatus,
    };
  }

  private toPageDto(
    list: RawRowData[],
    total: number,
    pageIndex: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    filter: FilterQuery[],
  ): MinimumTablePageDto {
    return {
      total, pageIndex, pageSize, sortBy, sortDirection, filter,
      rows: list.map((item, index) => this.toRowDto(item, index, pageIndex, pageSize, list)),
    };
  }
}

type RawRowData = any;
