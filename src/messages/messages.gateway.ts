import { WebSocketGateway, SubscribeMessage, WebSocketServer,  OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { Server, Socket } from 'socket.io'
import { AuthService } from 'src/auth/auth.service';
import { UseFilters, UseGuards } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { IsBlockedAndExist } from './socketguards/isUserBlockedAndExists.guard';
import { Message } from './messageEntities/message.entity';
import { WebsocketExceptionsFilter } from './exceptionfilter/exception.filter';
import { WebSocketRouteEntries, emitMessages, serverEmits, socketEmits } from 'src/constants/constant';

@WebSocketGateway({ cors : { origin: WebSocketRouteEntries.host}, namespace : WebSocketRouteEntries.namespaceName })
@UseFilters(new WebsocketExceptionsFilter())
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor (
    private messagesService: MessagesService,
    private authService: AuthService,
    private userService: UserService,
) {}

  @WebSocketServer()
  server : Server

  handleDisconnect(client: Socket) {
    this.server.emit(serverEmits.users, this.messagesService.disconnectedUsers(client));
  }

  async handleConnection(client: Socket) {
    if (!client.handshake.query.token) {
      client.emit(socketEmits.error, emitMessages.unauthorized);
      client.disconnect(true);
      return;
    }

try {
    const decodedToken = await this.authService.jwtVerify(client.handshake.query.token);
    const user = await this.userService.findbyId(decodedToken.id);
    if (!user) {
      client.emit(socketEmits.error, emitMessages.notFound);
      client.disconnect(true);
      return;
    }

    client['user'] = user;
    this.server.emit(serverEmits.users,this.messagesService.connectedUsers(client));
    } catch (err) {
      client.emit(socketEmits.error, err.message);
      client.disconnect(true);
      return;
  }
}  

  @SubscribeMessage(WebSocketRouteEntries.sendMessage)
  @UseGuards(IsBlockedAndExist)
  async sendMessage (
    client : Socket, 
    data : { id : number, message : string }
  ) {
    await this.messagesService.sendMessage(client['user'], data);
  }

  
  @SubscribeMessage(WebSocketRouteEntries.getMessageByID)
  async getById (
    socket : Socket,
    id : number,
  ) {
    const messages : Message[] = await this.messagesService.findMessagesById(socket['user'].id, id);
    socket.emit(socketEmits.messages, messages)
  }


  @SubscribeMessage(WebSocketRouteEntries.deleteChat)
  async deleteChat(
    socket : Socket,
    id : number ,
  ) {
    return await this.messagesService.deleteChat(socket['user'], id);
  }
}