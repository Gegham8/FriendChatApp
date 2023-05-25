import { CanActivate, ConflictException, ExecutionContext, Injectable } from "@nestjs/common";
import { ExceptionMessages } from "src/constants/constant";
import { UserService } from "src/user/user.service";


@Injectable()
export class ExistingUserGuard implements CanActivate {
    constructor (private _userService: UserService) {}
    async canActivate(context: ExecutionContext):  Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { email } = request.body;

        const existingUser = await this._userService.findByEmail(email);
        if (existingUser) {
            throw new ConflictException(ExceptionMessages.AlreadyExists);
        }
        return true;
    }
}