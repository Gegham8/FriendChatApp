import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { FriendEnitity } from 'src/entities/friend-request.entity';
import { FriendRequest } from 'src/entities/friend-request-status';
import { BlockedUser } from 'src/entities/blocked.users';
import { UserWithoutPassword,UserDetails } from 'src/models/user.dto';
import { BlockedFields, ExceptionMessages, FriendFields, FriendRequestStatus } from 'src/constants/constant';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private userRepository : Repository<User>,
        @InjectRepository(FriendEnitity) private friendRequest : Repository<FriendEnitity>,
        @InjectRepository(BlockedUser) private blockedUserRepository : Repository<BlockedUser>
    ) {}

    getUserDetail (user : User) : UserDetails {
        return {
            id : user.id,
            name : user.name,
            email : user.email,
        }
    }

    async findByEmail (email : string) : Promise<User | undefined> {
        const user =  await this.userRepository.findOne({
            where: { email : email },
        });

        if (!user) { return undefined };
        return user;
    }
    
    async findbyId (_id : number) : Promise<UserWithoutPassword> {
        const user = await this.userRepository.findOne({
            where: { id : _id },
            select : ['id', 'name', 'email']
        });
        if(!user) { throw new HttpException(ExceptionMessages.UserIsNotFound, HttpStatus.NOT_FOUND) };
        return user;
    }

    async create(
            name : string,
            email : string,
            hashedpassword : string
        ) : Promise<User> {
        const newUser = await this.userRepository.create({ 
            name,
            email,
            password : hashedpassword, 
        });
        return await this.userRepository.save(newUser);   
    }

    removePassword(user : any) : UserWithoutPassword {
        const { id, status, creator, blocked } = user;  
        const filteredBlockedUser  =  {
        id,
        status,
        creator: {
            id: creator.id,
            name: creator.name,
            email: creator.email
        },
        blocked: {
            id: blocked.id,
            name: blocked.name,
            email: blocked.email
        }
        };
        return filteredBlockedUser;
    }

    async sendFriendRequest(receiverId : number, user : User) : Promise<FriendRequest | { error : string }> {
        if (receiverId === user.id) { throw new HttpException(ExceptionMessages.RequestLogErr, HttpStatus.BAD_REQUEST)} 

        const creator = await this.findbyId(user.id);
        const receiver = await this.findbyId(receiverId);

        const friendRequest = await this.friendRequest.findOne({
            where : [
                { creator, receiver },
                { creator : receiver , receiver : creator }
                
            ], relations : [FriendFields.creator , FriendFields.receiver]
        
        });

        if (friendRequest && friendRequest.status !== FriendRequestStatus.pending && friendRequest.status !== FriendRequestStatus.accepted ) { 
            return await this.friendRequest.save({
                creator,
                receiver,
                status : FriendRequestStatus.pending
            })  
        } else if (!friendRequest) {
            return await this.friendRequest.save({
                creator,
                receiver,
                status : FriendRequestStatus.pending
            })   
        }
        throw new HttpException(ExceptionMessages.AlreadySend, HttpStatus.BAD_REQUEST)
    }    
    async getFriendRequestStatus (receiverId : number, user : User) : Promise<FriendRequest> {
        const creator = await this.findbyId(user.id);
        const receiver = await this.findbyId(receiverId);
        
        if (!receiver) { throw new HttpException(ExceptionMessages.UserIsNotFound, HttpStatus.NOT_FOUND);}
        
        const status  = await this.friendRequest.findOne({
            where : [
                { creator : creator, receiver : receiver },
                { creator : receiver , receiver : creator },
            ],
            relations : [FriendFields.creator, FriendFields.receiver]
        }).then(result => { 
            return { status : result?.status || 'not-sent' }
        })
        return status;
    }

    async updateFriendRequestStatus (id : number, updateedStatus : string, user : User) : Promise<FriendRequest> {
        const creator = await this.findbyId(user.id);
        const receiver = await this.findbyId(id);
        
        const friend = await this.friendRequest.findOne({
            where : [
                { creator : creator, receiver : receiver },
                { creator : receiver , receiver : creator },
            ],
        })
        
        if (!friend) { throw new HttpException(ExceptionMessages.NanRequests, HttpStatus.NOT_FOUND); }
        return await this.friendRequest.save({
            ...friend,
            status : updateedStatus
        })
    }
    async getAllFriends (user : User) : Promise<any[]> {
        const currentUser = await this.findbyId(user.id);
        let friendsId : number[] = [];
        
       await this.friendRequest.find({
            where : [
                { creator : currentUser, status : FriendRequestStatus.accepted},
                { receiver : currentUser, status : FriendRequestStatus.accepted}
            ],
            relations : [FriendFields.creator, FriendFields.receiver],
        }).then(result => {
            result.forEach((friend : FriendRequest) => {
                if (friend.creator.id === currentUser.id) {
                        friendsId.push(friend.receiver.id);
                } else if (friend.receiver.id === currentUser.id) {
                        friendsId.push(friend.creator.id);
                }
            })
        })
        return await this.userRepository
        .createQueryBuilder('user')
        .select(['user.id', 'user.name', 'user.email'])
        .whereInIds(friendsId)
        .getMany()
    }

    async blockUser (blockedUserId : number, user : User) : Promise<BlockedUser> {
        if (blockedUserId === user.id) { throw new HttpException(ExceptionMessages.AlreadySend, HttpStatus.CONFLICT)};

        const blockedUser = await this.findbyId(blockedUserId);
        const creator = await this.findbyId(user.id);
    
        const friends = await this.friendRequest.findOne({
            where : [
                { creator : creator, receiver : blockedUser },
                { creator : blockedUser , receiver : creator }
            ], relations : [FriendFields.creator , FriendFields.receiver]
        
        })

        if (friends) {
            await this.friendRequest.remove(friends);
        }

        return await this.blockedUserRepository.save({
            creator : creator,
            blocked : blockedUser,
            status : BlockedFields.blocked,
        })
    }

    async unlockUser (unlockedUserId : number, user : User)  : Promise<UserWithoutPassword> {
        if (unlockedUserId === user.id) { throw new HttpException(ExceptionMessages.AlreadySend, HttpStatus.CONFLICT)};
        
        const unlockUser = await this.findbyId(unlockedUserId);
        const currentUser = await this.findbyId(user.id);

        const checkBlocking = await this.blockedUserRepository.findOne ({
            where : [
                { creator : currentUser, blocked : unlockUser },
                { creator : unlockUser , blocked : currentUser }
            ], relations : [BlockedFields.creator , BlockedFields.blocked]
        })

        if (!checkBlocking) {
            throw new HttpException(ExceptionMessages.IsNotBlocked, HttpStatus.NOT_FOUND)
        }

        return this.removePassword(await this.blockedUserRepository.remove(checkBlocking));
    }

    async getAllBlockedUsers (user : User) : Promise<UserWithoutPassword[]> {
        const currentUser = await this.findbyId(user.id);
        let getAllBlockedUsersId : number[] = [];

        await this.blockedUserRepository.find({
            where: [{
                creator : currentUser, status : BlockedFields.blocked,
            }], relations : [BlockedFields.blocked]
        }).then((result) => {
            result.forEach((user) =>{
                getAllBlockedUsersId.push(user.blocked.id);
            })
        })
        
        return await this.userRepository
        .createQueryBuilder('user')
        .select(['user.id', 'user.name', 'user.email'])
        .whereInIds(getAllBlockedUsersId)
        .getMany()
    }
}

