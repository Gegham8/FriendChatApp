import { Controller, Get, Param, ParseIntPipe, UseGuards , Post, Request, Patch, Body, HttpException} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { IsBlocking } from 'src/auth/guards/is-user-blocked.guard';
import { FriendRequest } from 'src/entities/friend-request-status';
import { BlockedUser } from 'src/entities/blocked.users';
import { UserWithoutPassword } from 'src/models/user.dto';
import { Route } from 'src/constants/constant';


@Controller(Route.entry)
export class UserController {
    constructor (private userService: UserService) {};
    
    @UseGuards(JwtGuard)
    @Get(Route.getAllBlockedUsers)
    async getAllBlockedUsers(
        @Request() req
    ) : Promise<any[]> {
        return await this.userService.getAllBlockedUsers(req.user);
    }

    @UseGuards(JwtGuard)
    @Get(Route.getByID)
    findById(@Param('id', ParseIntPipe) id : number) : Promise<UserWithoutPassword> {
        return this.userService.findbyId(id);
    }

    @UseGuards(JwtGuard,IsBlocking)
    @Post(Route.sendFriendRequestById)
    sendFriendRequest(
        @Param('id', ParseIntPipe) id : number,
        @Request() req,
    ) : Promise<FriendRequest | { error : string } > {
        return this.userService.sendFriendRequest(id, req.user);
    }

    @UseGuards(JwtGuard,IsBlocking)
    @Get(Route.getFriendRequestStatusById)
    getFriendRequestStatus(
        @Param('id', ParseIntPipe) id : number,
        @Request() req
    ) : Promise<FriendRequest> {
        return this.userService.getFriendRequestStatus(id, req.user);
    }

    @UseGuards(JwtGuard,IsBlocking)
    @Patch(Route.updateFriendRequestStatusById)
    updateFriendRequestStatus (
        @Param('id', ParseIntPipe) id : number,
        @Body('status') respondeStatus : string,
        @Request() req
    ) : Promise<FriendRequest> {
        return this.userService.updateFriendRequestStatus(id, respondeStatus, req.user);
    }
    
    @UseGuards(JwtGuard)
    @Get(Route.getAllFriends)
    getAllFriends(
        @Request() req,
    ) : Promise<FriendRequest[]> {
        return this.userService.getAllFriends(req.user);
    }

    @UseGuards(JwtGuard,IsBlocking)
    @Patch(Route.blockUserById)
    blockUser(
        @Param('id', ParseIntPipe) id : number,
        @Request() req,
    ) : Promise<BlockedUser> {
        return this.userService.blockUser(id, req.user);
    }

    @UseGuards(JwtGuard)
    @Patch(Route.unlockUserById)
    unlockUser(
        @Param('id', ParseIntPipe) id : number,
        @Request() req,
    ) : Promise<UserWithoutPassword> {
      return this.userService.unlockUser(id, req.user);  
    }
}
