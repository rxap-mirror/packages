import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  NotImplementedException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { ToDtoInstance } from '@rxap/nest-dto';
import {
  FilterQuery,
  FilterQueryPipe,
} from '@rxap/nest-utilities';
import { DashboardAccordionGeneralInformationDashboardLocationTableSelectPageDto } from './dtos/dashboard-accordion-general-information-dashboard-location-table-select-page.dto';
import { DashboardAccordionGeneralInformationDashboardLocationTableSelectRowDto } from './dtos/dashboard-accordion-general-information-dashboard-location-table-select-row.dto';
import { DashboardAccordionGeneralInformationDashboardLocationTableSelectDto } from './dtos/dashboard-accordion-general-information-dashboard-location-table-select.dto';
import { DashboardAccordionGeneralInformationDashboardSubmitDto } from './dtos/dashboard-accordion-general-information-dashboard-submit.dto';
import { DashboardAccordionGeneralInformationDashboardDto } from './dtos/dashboard-accordion-general-information-dashboard.dto';

interface CompanyGuiControllerGetByFilterResponse {
  entities: any[];
}

@Controller('dashboard-accordion/:uuid/general-information-dashboard')
export class DashboardAccordionGeneralInformationDashboardController {
  private readonly companyGuiControllerGetByFilterCommand?: any;

  public async getPageData(sortBy: string, sortDirection: string, pageSize: number, pageIndex: number, filter: FilterQuery[]): Promise<{
      list: Array<CompanyGuiControllerGetByFilterResponse['entities'][number]>,
      total: number
    }> {
    const response = await this.companyGuiControllerGetByFilterCommand.execute({
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

  private toRowDto(item: CompanyGuiControllerGetByFilterResponse['entities'][number], index: number, pageIndex: number, pageSize: number, list: Array<CompanyGuiControllerGetByFilterResponse['entities'][number]>): DashboardAccordionGeneralInformationDashboardLocationTableSelectRowDto {
    return {
      __rowId: item.uuid,

    __value: item.uuid,
      __display: item.name,
      name: item.name,
      uuid: item.uuid
    };
  }

  private toPageDto(list: Array<CompanyGuiControllerGetByFilterResponse['entities'][number]>, total: number, pageIndex: number, pageSize: number, sortBy: string, sortDirection: string, filter: FilterQuery[]): DashboardAccordionGeneralInformationDashboardLocationTableSelectPageDto {
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
        isArray: true
      })
  public async getLocationControlTableSelectPage(@Query('pageIndex', new DefaultValuePipe(0)) pageIndex: number, @Query('pageSize', new DefaultValuePipe(5)) pageSize: number, @Query('sortDirection', new DefaultValuePipe('desc')) sortDirection: string, @Query('sortBy', new DefaultValuePipe('__updatedAt')) sortBy: string, @Query('filter', new FilterQueryPipe()) filter: Array<FilterQuery>): Promise<DashboardAccordionGeneralInformationDashboardLocationTableSelectPageDto> {
    const data = await this.getPageData(sortBy, sortDirection, pageSize, pageIndex, filter);
    return ToDtoInstance(
    DashboardAccordionGeneralInformationDashboardLocationTableSelectPageDto,
    this.toPageDto(data.list, data.total, pageIndex, pageSize, sortBy, sortDirection, filter),
    );
  }

  private readonly dashboardControllerGetByUuidCommand?: any;

  @Get()
  public async getById(@Param('uuid') uuid: string): Promise<DashboardAccordionGeneralInformationDashboardDto> {
    const data = await this.dashboardControllerGetByUuidCommand.execute({ parameters: { uuid } });
    return ToDtoInstance(
    DashboardAccordionGeneralInformationDashboardDto,
    {
      uuid: uuid,
      name: data.name!,
      location: data.location?.uuid,
      link: data.link!,
      company: data.company?.uuid,
      dashboardType: data.dashboardType!
    },
    );
  }



  private readonly companyGuiControllerGetByUuidCommand!: any;

  @Get('control/location/resolve/:value')
  public async resolveLocationControlValue(@Param('value') value: string): Promise<DashboardAccordionGeneralInformationDashboardLocationTableSelectDto> {
    const data = await this.companyGuiControllerGetByUuidCommand.execute({ parameters: { uuid: value } });
    return ToDtoInstance(
    DashboardAccordionGeneralInformationDashboardLocationTableSelectDto,
    {
      __rowId: data.uuid,
      __value: data.uuid,
      __display: data.name,
      name: data.name,
      uuid: data.uuid
    },
    );
  }

  @Post()
  public async submitById(@Param('uuid') uuid: string, @Body() body: DashboardAccordionGeneralInformationDashboardSubmitDto): Promise<void> {
    throw new NotImplementedException();
  }
}
