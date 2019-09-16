import { Controller, Post, Body } from '@nestjs/common';
import { LoadService } from '../load/dao/load.service';
import { TournamentService } from './tournament.service';
import { ReferenceInnerDTO } from '../load/dao/create.reference.inner.dto';
import { PlayersService } from './players.service';
import FileRoutes from '../constants/file.routes';

@Controller('tournament')
export class TournamentController {

    constructor(
        private readonly loadService: LoadService,
        private readonly tournamentService: TournamentService,
        private readonly playersService: PlayersService,
    ) {

    }

    @Post('/')
    async tournamentBegin(@Body('referenceName') referenceName: string): Promise<string> {
        const readReferencesCB = async (a: JSON[] | JSON): Promise<void> => {
            if (Array.isArray(a)) {
                const referencesArray: ReferenceInnerDTO[] = await a.map((r: any) => (
                    {
                        name: r.name,
                        endpoint: r.endpoint,
                    }
                ));
                await this.playersService.assignPlayers(referencesArray);
                await this.tournamentService.startTournaments(false, referenceName);
            }
        };
        try {
            await this.loadService.readReferences(FileRoutes.referencesDir, `${referenceName}.json` || FileRoutes.referencesFile, readReferencesCB);
            return `The tournament ${ referenceName } started.`;
        } catch (e) {
            return `The tournament ${ referenceName } doesn't exists.`;
        }
    }

}
