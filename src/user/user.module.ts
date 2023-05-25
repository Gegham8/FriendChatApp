import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserController } from './user.controller';
import { FriendEnitity } from 'src/entities/friend-request.entity';
import { JwtService } from '@nestjs/jwt';
import { BlockedUser } from 'src/entities/blocked.users';

@Module({
    imports : [TypeOrmModule.forFeature([User, FriendEnitity, BlockedUser])],
    controllers : [UserController],
    providers : [UserService,JwtService],
    exports : [UserService]
})
export class UserModule {}
