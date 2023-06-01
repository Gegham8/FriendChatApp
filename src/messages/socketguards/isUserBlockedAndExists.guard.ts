import { CanActivate, ExecutionContext, Injectable, NestMiddleware } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { WebSocketServer, WsException } from "@nestjs/websockets";
import { Observable } from "rxjs";
import { Server, Socket } from "socket.io";
import { User } from "src/entities/user.entity";
import { UserWithoutPassword } from "src/models/user.dto";
import { UserService } from "src/user/user.service";


@Injectable()
export class IsBlockedAndExist implements CanActivate {
    constructor (
        private userService : UserService
    
    ) {}
    
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const socket = context.switchToWs().getClient();
        const data = context.switchToWs().getData();
        try {
            if (!data.id) {
                socket.emit('error', { message : 'Id is undefined' })
                return;
            }
            const receiverUser = await this.userService.findByIdWithPassword(data.id);
            if (!receiverUser) {
                socket.emit('error', { message : 'User not found' })
                return false;
            }

            const blockedUsers = await this.userService.getAllBlockedUsers(socket.user);
            const receiverBlocedUsers = await this.userService.getAllBlockedUsers(receiverUser);

            if (blockedUsers.some((user) => user.id == data.id)) {
                socket.emit('error' , 'Receiver User is blocked');
                return;
              }

            if (receiverBlocedUsers.some((user) => user.id == socket.user.id)) {
                socket.emit('error' , 'Receiver User is blocked yourself');
                return;
            } 
            
            if (data.message === '') {
                return;
              }
        } catch (error) {
            socket.emit('error', { error: error.message });
            return;
        }
        return true;
    }
}