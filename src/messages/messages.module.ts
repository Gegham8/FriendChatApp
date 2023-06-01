import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './messageEntities/message.entity';
import { User } from 'src/entities/user.entity';

@Module({
  imports : [AuthModule,UserModule, TypeOrmModule.forFeature([Message, User])],
  providers: [ MessagesGateway, MessagesService]
})
export class MessagesModule {}
