import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BlockedUser } from "./blocked.users";
import {  FriendEnitity } from "./friend-request.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id : number;

    @Column({ type : 'varchar'})
    @IsNotEmpty({ message : 'Name is required' })
    name : string;

    @Column({ type : 'varchar'})
    @IsNotEmpty()
    @IsEmail()
    email : string;

    @Column({ type : 'varchar'})
    @IsNotEmpty({ message: 'Password is required' })
    @IsString({message: 'Password must be a string' })
    @MinLength(6)
    password : string;

    @OneToMany(() => FriendEnitity, (friend) => friend.creator)
    sentFriendRequest : FriendEnitity[];

    @OneToMany(() => FriendEnitity, (friend) => friend.receiver)
    receiveFriendRequest : FriendEnitity[];

    @OneToMany(() => BlockedUser, (blockedUser) => blockedUser.creator)
    sentBlockedRequest : BlockedUser[];

    @OneToMany(() => BlockedUser, (blockedUser) => blockedUser.blocked)
    blocked : BlockedUser[];
}