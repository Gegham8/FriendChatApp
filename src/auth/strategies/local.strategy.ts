import { PassportStrategy } from "@nestjs/passport"
import { Strategy } from "passport-local"
import { AuthService } from "../auth.service"
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ExceptionMessages } from "src/constants/constant";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor (private authService: AuthService) {
        super({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
          });
    }

    async validate (req : any , email : string, password : string) : Promise<any> {
        const user = await this.authService.validateUser(email, password);
        if (!user) {
            throw new UnauthorizedException(ExceptionMessages.InvalidData);
        }
        return user;
    }
}