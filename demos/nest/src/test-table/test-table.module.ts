import { Module } from '@nestjs/common';
import { TestTableController } from './test-table.controller';

@Module({
  controllers: [TestTableController],
})
export class TestTableModule {}
