import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TournamentController } from './tournament.controller';
import { TournamentService } from './tournament.service';
import { LoadService } from '../load/dao/load.service';
import { JudgementService } from './judgement.service';
import { PlayersService } from './players.service';
import { HttpService } from '../shared-services/http/http.service';
import { TournamentRepository } from './tournament.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TournamentRepository])],
  controllers: [TournamentController],
  providers: [TournamentService, LoadService, JudgementService, PlayersService, HttpService],
})
export class TournamentModule {}
