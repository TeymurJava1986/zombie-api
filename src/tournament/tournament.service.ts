import { Injectable, Logger } from '@nestjs/common';
import Player from './dao/player.model';
import { PlayersService } from './players.service';
import { JudgementService } from './judgement.service';
import { HttpService } from '../shared-services/http/http.service';

export enum TournamentEntities {
    collection = 'tournaments',
    tournament = 'tournament_',
    turn = 'turn_',
    player = 'player_',
}

const MOCK_APIS: string[] = [
    'http://www.mocky.io/v2/5d78951f3200001b9d9242c3',
    'http://www.mocky.io/v2/5d789540320000409d9242c6',
    'http://www.mocky.io/v2/5d78955f320000cfe29242c7',
    'http://www.mocky.io/v2/5d78956e3200005a9f9242c8',
    'http://www.mocky.io/v2/5d7895873200005a9f9242cc',
    'http://www.mocky.io/v2/5d7895ab320000409d9242ce',
    'http://www.mocky.io/v2/5d7895bc3200004bdb9242d0',
    'http://www.mocky.io/v2/5d7895c432000058d19242d1',
    'http://www.mocky.io/v2/5d7895dd320000cfe29242d2',
    'http://www.mocky.io/v2/5d7895f93200004bdb9242d6',
    'http://www.mocky.io/v2/5d789600320000bc979242d8',
    'http://www.mocky.io/v2/5d789608320000cfe29242d9'
];

const getUrl = (url: string) => {
    const index =  Math.floor(Math.random() * MOCK_APIS.length);
    return MOCK_APIS[index];
};

@Injectable()
export class TournamentService {
        constructor(
            private readonly playerService: PlayersService,
            private readonly httpService: HttpService,
            private readonly judgmentService: JudgementService,
        ) {}

        private _tournament: Map<number, Player> = new Map();
        private _tournamentHistory: Array<Array<Map<number, Player>>> = [];
        private _tournamentLevel: number = 0;
        private Logger = new Logger('TournamentService');

        public startTournaments = async (ifAssigned?: boolean): Promise<void> => {

            if (!this.playerService.players.length) {
                const isWinner = this.playerService.transportWinnersToPlayers();
                if (isWinner) {
                    this.logPlayer(isWinner, null, `Winner `);
                    return await this.saveTournamentHistory();
                }
            }

            if (ifAssigned) {
                await this.makeAction();
                this.Logger.log('==================================================================================================')
                this.Logger.log(`Tournament started ${ this.tournamentLevel}.`);
                this.Logger.log('==================================================================================================')
                return;
            }

            const firstPlayer = this.playerService.players.pop();
            const secondPlayer = this.playerService.players.pop();

            this.updateAssignPlayerTournament(firstPlayer);
            this.updateAssignPlayerTournament(secondPlayer);
            this.Logger.log('==================================================================================================')
            this.Logger.log(`Tournament started ${ this.tournamentLevel}.`);
            this.Logger.log('==================================================================================================')
            this.levelUp();
            await this.makeAction();
        }

        private makeAction = async (): Promise<void> => {

            if (this.tournament.size === 0) {
                this.Logger.log('==================================================================================================')
                this.Logger.log(`Restart tournament.`);
                this.Logger.log('==================================================================================================')
                return this.startTournaments();
            }

            const tournamentPlayer = this.tournament.values();
            const playerOne = tournamentPlayer.next().value;
            const playerTwo = tournamentPlayer.next().value;

            playerOne.endpoint = getUrl(playerOne.endpoint);
            playerTwo.endpoint = getUrl(playerTwo.endpoint);

            const firstAction: string = await this.httpService.postAction(playerOne.endpoint, playerOne, playerTwo);
            playerOne.lastAction = firstAction.trim().toLowerCase();
            const isFirstActionOk = this.judgmentService.verifyPlayerAction(playerOne.lastAction, playerOne);

            const secondAction: string = await this.httpService.postAction(playerTwo.endpoint, playerTwo, playerOne);
            playerTwo.lastAction = secondAction.trim().toLowerCase();
            const isSecondActionOk = this.judgmentService.verifyPlayerAction(playerTwo.lastAction, playerTwo);

            // if something wrong with actions
            if (!isFirstActionOk && !isSecondActionOk) {
                const actionP1 = await this.recallAction(playerOne, playerTwo);
                const actionP2 = await this.recallAction(playerOne, playerTwo);
                if (!actionP1 && actionP2) {
                    this.resetTournament();
                    return await this.startTournaments();
                }

                if (!!actionP1) {
                    playerOne.lastAction = actionP1;
                } else {
                    if (!!this.playerService.waitingPlayer) {
                        return this.isWaitingPlayerTournament(playerTwo);
                    }

                    this.playerService.addWinner(playerTwo);
                    this.resetTournament();
                    return await this.startTournaments();
                }

                if (!!actionP2) {
                    playerTwo.lastAction = actionP2;
                } else {
                    if (!!this.playerService.waitingPlayer) {
                        return this.isWaitingPlayerTournament(playerOne);
                    }

                    this.playerService.addWinner(playerOne);
                    this.resetTournament();
                    return await this.startTournaments();
                }

            } else if (!isFirstActionOk) {
                const action = await this.recallAction(playerOne, playerTwo);
                if (!!action) {
                    playerOne.lastAction = action;
                } else {
                    if (!!this.playerService.waitingPlayer) {
                        return this.isWaitingPlayerTournament(playerTwo);
                    }

                    this.playerService.addWinner(playerTwo);
                    this.resetTournament();
                    return await this.startTournaments();
                }
            } else if (!isSecondActionOk) {
                const action = await this.recallAction(playerOne, playerTwo);
                if (!!action) {
                    playerTwo.lastAction = action;
                } else {
                    if (!!this.playerService.waitingPlayer) {
                        return this.isWaitingPlayerTournament(playerOne);
                    }

                    this.playerService.addWinner(playerOne);
                    this.resetTournament();
                    return await this.startTournaments();
                }
            }


            playerOne.recalculateSelf();
            playerTwo.recalculateSelf();

            const recalculatedPlayersActions = this.judgmentService.recalculatePlayerActions(playerOne, playerTwo);

            const updatedFirstPlayer =  recalculatedPlayersActions.firstPlayer;
            const updatedSecondPlayer = recalculatedPlayersActions.secondPlayer;

            this.updateAssignPlayerTournament(updatedFirstPlayer);
            this.updateAssignPlayerTournament(updatedSecondPlayer);

            this.addTournamentHistory();

            if (this.judgmentService.isPlayerLoosed(updatedFirstPlayer)) {

                if (!!this.playerService.waitingPlayer) {
                    return this.isWaitingPlayerTournament(updatedSecondPlayer);
                }

                this.playerService.addWinner(updatedSecondPlayer);
                this.resetTournament();
                return await this.startTournaments();
            }

            if (this.judgmentService.isPlayerLoosed(updatedSecondPlayer)) {

                if (!!this.playerService.waitingPlayer) {
                    return this.isWaitingPlayerTournament(updatedFirstPlayer);
                }

                this.playerService.addWinner(updatedFirstPlayer);
                this.resetTournament();
                return await this.startTournaments();
            }
            this.logPlayer(updatedFirstPlayer, updatedSecondPlayer);
            this.makeAction();
        }

        private logPlayer = (p1?: Player, p2?: Player, prefix?: string, suffix?: string): void => {
            this.Logger.log(`${prefix || ''} Players: ${p1 && p1.toString()} ${p2 && p2.toString()} ${suffix || ''}`);
        }

        private getCollection = async (): Promise<any> => {
            // return await MongoHelper.client.db(process.env.DB_NAME).collection(TournamentEntities.collection);
        }

        private saveTournamentHistory = async (): Promise<void> => {
            // const collection = await this.getCollection();
            const insert = this._tournamentHistory.map((arr: Array<Map<number, Player>>, level: number) => {
                const levelIndex = level;

                const data = arr.reduce((accumulator: Map<string, any>, currentValue: Map<number, Player>, action: number) => {
                    const iter = currentValue.values();
                    const fp: Player = iter.next().value;
                    const sp: Player = iter.next().value;
                    const actionIndex = action;
                    const tournament = `${TournamentEntities.tournament}${levelIndex}`;
                    const currentDataArr = accumulator.get(tournament) || [];
                    const newAction = {
                        [`${TournamentEntities.turn}${actionIndex}`]: {
                            [`${TournamentEntities.player}${fp.id}`]: {
                                name: fp.name,
                                shoot: fp.shoot,
                                reload: fp.reload,
                                block: fp.block,
                                lives: fp.lives,
                                game: fp.gameStatus,
                                action: fp.lastAction,
                            },
                            [`${TournamentEntities.player}${sp.id}`]: {
                                name: sp.name,
                                shoot: sp.shoot,
                                reload: sp.reload,
                                block: sp.block,
                                lives: sp.lives,
                                game: sp.gameStatus,
                                action: sp.lastAction,
                            },
                        },
                    };
                    currentDataArr.push(newAction);
                    accumulator.set(tournament, currentDataArr);

                    return accumulator;
                }, new Map());

                return data;
            });
            // await collection.insertOne({ ...insert });
            this.playerService.resetWinners();
            this.playerService.resetWaitingPlayer();
            this.playerService.resetPlayers();
            this.Logger.log(`======== History logged in to DB. ========`);
            return;
        }

        private recallAction = async (p: Player, o: Player): Promise<string | null> => {
            let counter = 0;
            let result: string = null;
            const maxCall = 2;
            while (counter < maxCall) {
                const action: string = await this.httpService.postAction(p.endpoint, p, o);
                const isActionOk = this.judgmentService.verifyPlayerAction(action, p);
                if (isActionOk) {
                    counter = 10;
                    result = action;
                }
                counter++;
            }
            return result;
        }

        private isWaitingPlayerTournament = (p: Player): void => {

            const assignedMap: Map<number, Player> = new Map();
            const waitingPlayer = this.playerService.waitingPlayer;
            assignedMap.set(waitingPlayer.id, waitingPlayer);
            const rp = this.playerService.resetPlayerProperties(p);
            assignedMap.set(rp.id, rp);
            this.playerService.resetWaitingPlayer();
            this.resetTournament();
            this.updateTournament(assignedMap);
            this.startTournaments(true);
        }

        private updateAssignPlayerTournament(p: Player) {
            this._tournament.set(p.id, p);
        }

        private resetTournament(): void {
            this._tournament = new Map();
        }

        private updateTournament(t: Map<number, Player>): void {
            this._tournament = new Map(t);
        }

        private addTournamentHistory(): void {
            const map = new Map(this.tournament);
            if (!this._tournamentHistory[this.tournamentLevel]) {
                this._tournamentHistory[this.tournamentLevel] = [];
            }
            this._tournamentHistory[this.tournamentLevel].push(map);
        }

        get tournament(): Map<number, Player> {
            return this._tournament;
        }

        get tournamentLevel(): number {
            return this._tournamentLevel;
        }

        set tournamentLevel(l: number) {
            this._tournamentLevel = l;
        }

        private levelUp = (): void => {
            this.tournamentLevel = this.tournamentLevel + 1;
        }

        get tournamentHistory(): Array<Map<number, Player>> {
            return this._tournamentHistory[this.tournamentLevel];
        }
}
