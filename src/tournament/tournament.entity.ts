import { BaseEntity, Entity, ObjectID, ObjectIdColumn, Column, Index } from 'typeorm';

export interface PlayerResult {
    name: string;
    shoot: number;
    reload: number;
    block: number;
    lives: number;
    game: 'hurt' | 'not hurt' | 'killed';
    action: 'shoot' | 'reload' | 'block';
}

export interface Turn {
    firstPlayer: PlayerResult;
    secondPlayer: PlayerResult;
}

@Entity({
    name: 'tournament',
})
export class Tournament extends BaseEntity {

    @ObjectIdColumn({
        name: '_id',
        type: 'string',
    })
    public _id: ObjectID;

    @Column({
        name: 'tournamentName',
        type: 'string',
        nullable: false,
    })
    @Index()
    public tournamentName: string;

    @Column({
        name: 'tournamentIndex',
        type: 'int',
        nullable: false,
    })
    public tournamentIndex: number;

    @Column({
        name: 'turns',
        type: 'array',
    })
    public turns: Turn[];
}
