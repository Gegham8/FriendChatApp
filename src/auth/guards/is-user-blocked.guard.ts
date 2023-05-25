import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { UserWithoutPassword } from "src/models/user.dto";
import { ExceptionMessages } from "src/constants/constant";

@Injectable()
export class IsBlocking implements CanActivate {
    constructor (
        private readonly userService: UserService
    ) {}
    async canActivate(context: ExecutionContext) : Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        await this.userService.getAllBlockedUsers(request.user)
        .then((users  : UserWithoutPassword[]) => {
            users.forEach((user : UserWithoutPassword) => {
                if (user.id == request.params.id) { throw new HttpException(ExceptionMessages.IsBlocked, HttpStatus.CONFLICT )}
            })
        })
        return true;
    }       
}