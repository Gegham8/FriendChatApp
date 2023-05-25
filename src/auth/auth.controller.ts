import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { NewUserDto } from 'src/user/dto/newuser.dto';
import { ExistingUserDto } from 'src/user/dto/existing.user';
import { LocalGuard } from './guards/loacl.guard';
import { ExistingUserGuard } from './guards/existing.user.guard';
import { AuthRouter } from 'src/constants/constant';
import { UserDto, UserDetails } from 'src/models/user.dto';

@Controller(AuthRouter.entry)
export class AuthController {
    constructor (private authService: AuthService) {}
    
    @Post(AuthRouter.register)
    @UsePipes(new ValidationPipe())
    @UseGuards(ExistingUserGuard)
    async register (@Body() user : NewUserDto) : Promise<UserDetails | any> {
        return this.authService.register(user);
    }

    @Post(AuthRouter.login)
    @UseGuards(LocalGuard)
    @HttpCode(HttpStatus.OK)
    login (@Body() user : UserDto) : Promise<{ token: string }> {
        return this.authService.login(user);
    }
}