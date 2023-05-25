import { User } from "./user.entity";

export interface FriendRequest {
    id? : number;
    creator? : User;
    receiver? : User;
    status? : string;
}