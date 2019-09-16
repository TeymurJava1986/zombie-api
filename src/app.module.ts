import { Module } from '@nestjs/common';
import { LoadModule } from './load/load.module';
import { TournamentModule } from './tournament/tournament.module';
import { JudgementService } from './tournament/judgement.service';
import { PlayersService } from './tournament/players.service';
import { HttpModule } from './shared-services/http/http.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    LoadModule,
    TournamentModule,
    JudgementService,
    PlayersService,
    HttpModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
