import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
    imports : [
        UserModule, 
        JwtModule.registerAsync ({
            useFactory : () => ({
                secret : process.env.SECRET_KEY,
                signOptions : { expiresIn : process.env.EXPIRES_IN }
            }),
        })
    ],
    controllers : [AuthController],
    providers : [AuthService, LocalStrategy]
})
export class AuthModule {}
