import { Module } from '@nestjs/common';
import { LoadService } from './dao/load.service';
import { LoadController } from './load.controller';

@Module({
  providers: [LoadService],
  controllers: [LoadController],
})
export class LoadModule {}
