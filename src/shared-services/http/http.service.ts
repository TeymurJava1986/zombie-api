import { Injectable, Logger } from '@nestjs/common';
import * as request from 'superagent';
import Player from '../../tournament/dao/player.model';

@Injectable()
export class HttpService {
    private readonly http: request.SuperAgentStatic = request;
    private Logger = new Logger('HttpService');

    public postAction = async (url: string, p: Player, o: Player): Promise<string> => {
        const data = (!!p.lastAction && p.gameStatus !== 'killed') ? {
            playerAction: p.lastAction,
            playerLife: p.lives,
            opponentAction: o.lastAction,
            opponentLife: o.lives,
            result: {
                player: p.gameStatus,
                opponent: o.gameStatus,
            },
        } : {
            game: p.gameStatus === 'killed' ? 'killed' : 'begin',
        };
        try {
            const result = await this.http.post(url)
            .send(data)
            .set('Accept', 'application/json');
            return result && result.body && result.body.action;
        } catch (e) {
            this.Logger.log(`Request on action for player: ${ p.toString() } is failed.`);
            return '';
        }
    }
}
