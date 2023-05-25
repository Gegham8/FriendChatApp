import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class BlockedUser {
    @PrimaryGeneratedColumn()
    id : number;

    @ManyToOne(() => User, (user) => user.sentBlockedRequest)
    creator : User;

    @ManyToOne(() => User, (user) => user.blocked)
    blocked : User;

    @Column()
    status : string
}