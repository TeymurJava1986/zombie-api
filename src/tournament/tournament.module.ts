import { Module } from '@nestjs/common';
import { TournamentController } from './tournament.controller';
import { TournamentService } from './tournament.service';
import { LoadService } from '../load/dao/load.service';
import { JudgementService } from './judgement.service';
import { PlayersService } from './players.service';
import { HttpService } from '../shared-services/http/http.service';

@Module({
  controllers: [TournamentController],
  providers: [TournamentService, LoadService, JudgementService, PlayersService, HttpService],
})
export class TournamentModule {}
