import { Logger } from '@nestjs/common';
import { Repository, EntityRepository } from 'typeorm';
import { Tournament, Turn } from './tournament.entity';
import Player from './dao/player.model';

export enum TournamentEntities {
    collection = 'tournaments',
    tournament = 'tournament_',
    turn = 'turn_',
    player = 'player_',
}

export interface ITournamentRepository {
    saveTournament: (h: Array<Array<Map<number, Player>>>, t: string) => Promise<void>;
}

@EntityRepository(Tournament)
export class TournamentRepository extends Repository<Tournament> implements ITournamentRepository {

    private Logger = new Logger('TournamentRepository');

    public saveTournament = async (h: Array<Array<Map<number, Player>>>, t: string): Promise<void> => {
        h.map( async (arr: Array<Map<number, Player>>, level: number) => {
            const levelIndex = level;
            const newArr = arr.map((currentValue: Map<number, Player>) => {
                const iter = currentValue.values();
                const fp: Player = iter.next().value;
                const sp: Player = iter.next().value;
                const newAction = {
                    firstPlayer: {
                        name: fp.name,
                        shoot: fp.shoot,
                        reload: fp.reload,
                        block: fp.block,
                        lives: fp.lives,
                        game: fp.gameStatus,
                        action: fp.lastAction,
                    },
                    secondPlayer: {
                        name: sp.name,
                        shoot: sp.shoot,
                        reload: sp.reload,
                        block: sp.block,
                        lives: sp.lives,
                        game: sp.gameStatus,
                        action: sp.lastAction,
                    },
                };
                return newAction;
            });
            const tournament = new Tournament();
            tournament.tournamentName = t;
            tournament.tournamentIndex = levelIndex;
            tournament.turns = newArr as Turn[];
            try {
                await tournament.save();
                this.Logger.log(`Tournament: ${ t } level: ${ levelIndex } is saved.`);
            } catch (e) {
                this.Logger.log(`Tournament: ${ t } wasn't saved.`);
            }
        });
        return;
    }
}
