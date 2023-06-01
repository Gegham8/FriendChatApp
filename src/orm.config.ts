import dotenv from 'dotenv';
require('dotenv').config()
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { BlockedUser } from './entities/blocked.users';
import { FriendEnitity } from './entities/friend-request.entity';
import { Message } from './messages/messageEntities/message.entity';

export const configService : TypeOrmModule = {
    type : 'mysql',
    host : process.env.MYSQL_HOST,
    port : parseInt(process.env.MYSQL_PORT),
    username : process.env.USERNAME,
    password : process.env.PASSWORD,
    database : process.env.DATABASE,
    entities : [User, BlockedUser, FriendEnitity, Message],
    synchronize : true,

}