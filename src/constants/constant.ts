export const Route = {
    entry : 'user',
    getByID : ':id',
    sendFriendRequestById : 'friend-request/:id',
    getFriendRequestStatusById : 'friend-request/status/:id',
    updateFriendRequestStatusById : 'friend-request-status/update/:id',
    getAllFriends : 'friends/received-requests',
    blockUserById : 'block-user/:id',
    unlockUserById : 'unlock-user/:id',
    getAllBlockedUsers : 'blocked-users'
}

export const AuthRouter = {
    entry : 'auth',
    login : 'login',
    register : 'register',
}

export const FriendFields = {
    creator : 'creator',
    receiver : 'receiver',
}

export const BlockedFields = {
    creator : 'creator',
    blocked : 'blocked',
}

export const FriendRequestStatus = {
    accepted : 'accepted',
    pending : 'pending',
    declined : 'declined',
}

export const BlockeStatus = {
    blocked : 'blocked',
}

export const ExceptionMessages = {
    UserIsNotFound : 'User is not found',
    RequestLogErr : 'Can not send request to yourself',
    AlreadySend : 'A request has already been sent of received to your account',
    NanRequests : 'Not Found any request',
    IsNotBlocked : 'User is not blocked',
    AlreadyExists : 'User is already exists',
    IsBlocked : 'User is blocked',
    InvalidData : 'Invalid email or password'

}