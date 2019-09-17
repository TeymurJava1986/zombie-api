import { BaseEntity, Entity, Column, Index, PrimaryGeneratedColumn } from 'typeorm';

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

    @PrimaryGeneratedColumn({
        type: 'int',
        name: 'id',
    })
    public id: number;

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
