import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";


@Entity() 
export class FriendEnitity {
    @PrimaryGeneratedColumn()
    id : number;

    @ManyToOne(() => User, (user) =>  user.sentFriendRequest)
    creator : User;

    @ManyToOne(() => User, (user) => user.receiveFriendRequest)
    receiver : User;

    @Column()
    status : string;
}