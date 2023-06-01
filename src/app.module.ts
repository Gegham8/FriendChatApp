import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from './orm.config';
import { AuthModule } from './auth/auth.module';
import { MessagesModule } from './messages/messages.module';
import { MessagesGateway } from './messages/messages.gateway';

@Module({
  imports: [AuthModule,ConfigModule.forRoot({ isGlobal: true, envFilePath : '../.env'}),
  TypeOrmModule.forRoot(configService),
  MessagesModule,
],
  controllers: [],
  providers: [],
})
export class AppModule {}
