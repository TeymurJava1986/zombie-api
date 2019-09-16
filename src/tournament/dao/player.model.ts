import { Actions } from '../judgement.service';

export interface IPlayer {
    id: number;
    name: string;
    endpoint: string;
    shoot: number;
    reload: number;
    block: number;
    gameStatus: string;
    lastAction: string;
}

const MAX_PLAYER_BLOCKS: number = 3;

export default class Player implements IPlayer {
    private _id: number;
    private _endpoint: string;
    private _name: string;
    private _shoot: number;
    private _reload: number;
    private _block: number;
    private _lives: number = 3;
    private _lastAction: string;
    private _gameStatus: string = undefined;

    constructor(props?: IPlayer) {
        this._id = props.id;
        this._name = props.name;
        this._shoot = props.shoot;
        this._reload = props.reload;
        this._block = props.block;
        this._endpoint = props.endpoint;
        this._gameStatus = props.gameStatus;
        this.lastAction = props.lastAction;

    }

    get id(): number {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get gameStatus(): string {
        return this._gameStatus;
    }

    set gameStatus(s: string) {
        this._gameStatus = s;
    }

    get endpoint(): string {
        return this._endpoint;
    }

    // TODO: should be removed
    set endpoint(e: string) {
        this._endpoint = e;
    }

    get lastAction(): string {
        return this._lastAction;
    }

    set lastAction(la: string) {
        this._lastAction = la;
    }

    get lives(): number {
        return this._lives;
    }

    set lives(l: number) {
        this._lives = l;
    }

    get shoot(): number {
        return this._shoot;
    }

    set shoot(s: number) {
        this._shoot = s;
    }

    get reload(): number {
        return this._reload;
    }

    set reload(r: number) {
        this._reload = r;
    }

    get block(): number {
        return this._block;
    }

    set block(b: number) {
        this._block = b;
    }

    public recalculateSelf = (): void => {
        switch(this.lastAction) {
            case Actions.block: 
                this.block = this.block++;
                if (this.block > MAX_PLAYER_BLOCKS) {
                    this.lives = this.lives - 1;
                }
                break;
            case Actions.shoot:
                if (this.shoot === 0) {
                    this.lives = this.lives - 1;  
                    break;
                }
                this.shoot = this.shoot - 1;
                this.block = 0;
                break;
            case Actions.reload:
                this.reload = this.reload + 1;
                this.block = 0;
                this.shoot = 1;
                break;
        }
    }

    public toString = (): string => {
        return `Player: (name: ${ this.name } lives: ${ this.lives } lastAction: ${ this.lastAction } gameStatus: ${ this.gameStatus }
            id: ${ this.id } shoot: ${ this.shoot } reload: ${ this.reload } block: ${ this.block } endpoint: ${ this.endpoint })`;
    }
    
}