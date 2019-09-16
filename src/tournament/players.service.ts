import { Injectable, Logger } from '@nestjs/common';
import { GameStatus } from './judgement.service';
import Player from './dao/player.model';
import { ReferenceInnerDTO } from 'src/load/dao/create.reference.inner.dto';

export interface IDefaultPlayerActions {
    shoot: number;
    block: number;
    reload: number;
    lives: number;
}

@Injectable()
export class PlayersService {
    private _players: Array<Player> = [];
    private _waitingPlay: Player;
    private _winners: Array<Player> = [];
    private Logger = new Logger('PlayersService');

    private readonly _defaultActions: IDefaultPlayerActions = {
        shoot: 1,
        block: 0,
        reload: 0,
        lives: 3,
    };

    get waitingPlayer(): Player {
        return this._waitingPlay;
    }

    set waitingPlayer(p: Player) {
        if (!p.name || !p.endpoint) {
            this.Logger.log(`Player cannot be assign with name ${ p.name } and endpoint ${ p.endpoint }`);
            return;
        }
        this._waitingPlay = p;
    }

    public resetWaitingPlayer = (): void => {
        this._waitingPlay = undefined;
    }

    public resetPlayers = (): void => {
        this._players = [];
    }

    get players(): Player[] {
        return this._players;
    }

    set players(p: Player[]) {
        this._players = p;
    }

    get winners(): Player[] {
        return this._winners;
    }

    set winners(w: Player[]) {
        this._winners = w;
    }

    public resetWinners = (): void => {
        this._winners = [];
    }

    public transportWinnersToPlayers = (): Player => {
        if (this._winners.length > 1) {
            this.assignPlayers(this.winners);
            this.winners = [];
            return;
        }
        return this.winners[0];
    }

    public addWinner = (p: Player) => {
        this.winners = this.winners.concat(p);
    }

    get defaultActions(): IDefaultPlayerActions {
        return this._defaultActions;
    }

    public resetPlayerProperties = (p: Player): Player => {
        return new Player({
            id: p.id,
            endpoint: p.endpoint,
            gameStatus: GameStatus.notHurt,
            name: p.name,
            lastAction: '',
            ...this.defaultActions,
        });
    }

    public assignPlayers = (players: ReferenceInnerDTO[]) => {
        if (players.length % 2 === 1) {
            const ref = players.pop();
            this.waitingPlayer = new Player({
                id: 0,
                endpoint: ref.endpoint,
                gameStatus: GameStatus.notHurt,
                name: ref.name,
                lastAction: '',
                ...this.defaultActions,
            });
        }
        this.players = players.map((ro: ReferenceInnerDTO, i: number) => {
            const id = i++;
            return new Player({
                id,
                endpoint: ro.endpoint,
                gameStatus: GameStatus.notHurt,
                name: ro.name,
                lastAction: '',
                ...this.defaultActions,
            });
        });
        this.Logger.log(`Players were assigned successfully.`);
    }
}