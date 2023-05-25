import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NewUserDto } from 'src/user/dto/newuser.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { UserDto, UserDetails } from 'src/models/user.dto';

@Injectable()
export class AuthService {
    constructor (
        private userService : UserService,
        private jwtService : JwtService    
    ) {}
    
    async validateUser (email : string, password : string) : Promise<User> {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            return null;
        }
        const PasswordMatch = await bcrypt.compare(password, user.password)
        if (!PasswordMatch) {
            return null;
        }

        return user;
    }

    async register (user : NewUserDto) : Promise <UserDetails> {
        const { name, email, password } = user;
        const hashedPassword = await bcrypt.hashSync(password, parseInt(process.env.SALT));

        const newUser = await this.userService.create(name, email, hashedPassword);
        return this.userService.getUserDetail(newUser);
    }

    async login(user : UserDto) : Promise<{ token : string }> {
        const ForJwt = await this.userService.findByEmail(user.email);
        const jwt =  this.jwtService.sign ({id : ForJwt.id });
        return { token : jwt };
    }   
}