import {
  Controller,
  DefaultValuePipe,
  Get,
  NotImplementedException,
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

@Controller()
export class MinimumTableController {
  private toMinimumTableRowDto(item: any, index = 0, pageIndex = 0, pageSize = 1, list = [item]): MinimumTableRowDto {
    return {
    __rowId: item.uuid,
    name: item.name,
    age: item.age,
    isActive: item.isActive,
    email: item.email,
    rating: item.rating,
    accountStatus: item.accountStatus
    };
  }

  private toMinimumTablePageDto(list: any[], total: number = list.length, pageIndex = 0, pageSize: number = list.length, sortBy = '', sortDirection = '', filter: FilterQuery[] = []): MinimumTablePageDto {
    return {
    total, pageIndex, pageSize, sortBy, sortDirection, filter,
    rows: list.map((item, index) => this.toMinimumTableRowDto(item, index, pageIndex, pageSize, list))
    };
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
        isArray: false
      })
  public async getPage(@Query('sortBy', new DefaultValuePipe('__updatedAt')) sortBy: string, @Query('sortDirection', new DefaultValuePipe('desc')) sortDirection: string, @Query('pageSize', new DefaultValuePipe(5)) pageSize: number, @Query('pageIndex', new DefaultValuePipe(0)) pageIndex: number, @Query('filter', new FilterQueryPipe()) filter?: FilterQuery[]): Promise<MinimumTablePageDto> {
    const response = await ((() => { throw new NotImplementedException(); })() as any).execute({
          parameters: {
            page: pageIndex,
            size: pageSize,
            sort: sortBy,
            order: sortDirection,
            filter: filter.map((item) => `${ item.column }:${ item.filter }`).join(';'),
          },
        });
    return plainToInstance(
    MinimumTablePageDto,
    this.toMinimumTablePageDto(response.entities ?? [], response.maxCount ?? 0, pageIndex, pageSize, sortBy, sortDirection, filter),
    classTransformOptions
    );
  }
}
