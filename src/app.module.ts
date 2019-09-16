import { Module } from '@nestjs/common';
import { LoadModule } from './load/load.module';
import { ShowResultsModule } from './show-results/show-results.module';
import { TournamentModule } from './tournament/tournament.module';
import { JudgementService } from './tournament/judgement.service';
import { PlayersService } from './tournament/players.service';
import { HttpModule } from './shared-services/http/http.module';

@Module({
  imports: [LoadModule, ShowResultsModule, TournamentModule, JudgementService, PlayersService, HttpModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
