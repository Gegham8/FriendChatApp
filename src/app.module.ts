import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from './orm.config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule,ConfigModule.forRoot({ isGlobal: true, envFilePath : '../.env'}),
  TypeOrmModule.forRoot(configService)],
  controllers: [],
  providers: [],
})
export class AppModule {}
