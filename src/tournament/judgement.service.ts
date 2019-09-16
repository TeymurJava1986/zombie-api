import { Injectable } from '@nestjs/common';
import Player from './dao/player.model';

export enum Actions {
    shoot = 'shoot',
    reload = 'reload',
    block = 'block',
}

export enum GameStatus {
    hurt = 'hurt',
    notHurt = 'not hurt',
    killed = 'killed',
}

const MIN_PLAYER_LIVES: number = 1;

@Injectable()
export class JudgementService {

    public verifyPlayerAction = (action: string, player: Player): boolean => {
        switch (action) {
            case Actions.shoot:
                return true;
            case Actions.reload:
                return true;
            case Actions.block:
                return true;
            default: return false;
        }
    }

    public isPlayerLoosed = (p: Player): boolean => {
        return p.lives < MIN_PLAYER_LIVES || p.gameStatus.trim() === GameStatus.killed;
    }

    public recalculatePlayerActions = (firstPlayer: Player, secondPlayer: Player) => {
        if (firstPlayer.lastAction === secondPlayer.lastAction) {
            firstPlayer.gameStatus = GameStatus.notHurt;
            secondPlayer.gameStatus = GameStatus.notHurt;
            return {
                firstPlayer,
                secondPlayer,
            };
        } else if (firstPlayer.lastAction === Actions.shoot && secondPlayer.lastAction === Actions.reload) {

            secondPlayer.lives = secondPlayer.lives - 1;

            if (secondPlayer.lives < MIN_PLAYER_LIVES) {
                secondPlayer.gameStatus = GameStatus.killed;
            } else {
                secondPlayer.gameStatus = GameStatus.hurt;
            }

            firstPlayer.gameStatus = GameStatus.notHurt;
        } else if (secondPlayer.lastAction === Actions.shoot && firstPlayer.lastAction === Actions.reload) {
            firstPlayer.lives = firstPlayer.lives - 1;

            if (firstPlayer.lives < MIN_PLAYER_LIVES ) {
                firstPlayer.gameStatus = GameStatus.killed;
            } else {
                firstPlayer.gameStatus = GameStatus.hurt;
            }

            secondPlayer.gameStatus = GameStatus.notHurt;
        } else {
            firstPlayer.gameStatus = GameStatus.notHurt;
            secondPlayer.gameStatus = GameStatus.notHurt;
        }
        return {
            firstPlayer,
            secondPlayer,
        };
    }
}
