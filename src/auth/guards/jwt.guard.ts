import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";


@Injectable()
export class JwtGuard implements CanActivate {
    constructor (
        private jwtService : JwtService, 
        private configService : ConfigService
    ) {}

    async canActivate(context: ExecutionContext) : Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractToken(request);
        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            const paylaod = await this.jwtService.verifyAsync(
                token, 
                {
                    secret : this.configService.get<string>('SECRET_KEY'),
                }
            );
        request['user'] = paylaod;
        } catch (err) {
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractToken(request : Request) : string | undefined {
        const [type, token] = request.headers.authorization?.split(' ')?? [];
        return type === 'Bearer' ? token : undefined;
    }
}