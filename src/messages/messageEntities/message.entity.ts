import { IsNotEmpty } from "class-validator";
import { User } from "src/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id : number;

    @Column()
    @IsNotEmpty()
    content : string

    @ManyToOne(() => User, (user) =>  user.sentMessage)
    messageCreator : User;

    @ManyToOne(() => User, (user) => user.messageReceiver)
    messageReceiver : User;

    @Column()
    sendTime : Date;
}
