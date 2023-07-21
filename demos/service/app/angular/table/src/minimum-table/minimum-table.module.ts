import { Module } from '@nestjs/common';
import { MinimumTableController } from './minimum-table.controller';

@Module({
  controllers: [MinimumTableController]
})
export class MinimumTableModule {
}
