import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { Message } from './messageEntities/message.entity';
import { WsExceptionMessages, socketEmits } from 'src/constants/constant';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Message) private messageRepository: Repository<Message>
  ) {}
  
    connectedClients: Map<number, Socket> = new Map();
  
    connectedUsers(client : Socket) {
      this.connectedClients.set(client['user'].id, client);
      return Array.from(this.connectedClients.keys());;
    }

    disconnectedUsers(client : Socket) {
      this.connectedClients.delete(client['user'].id);
      return Array.from(this.connectedClients.keys());;
    }
  
  async sendMessage(creator : User, data : any) {
    const receiver = await this.userRepository.findOne({
      select : ['name', 'email', 'id'],
      where : { id : data.id } 
    });

    const message =  this.messageRepository.create({
        content : data.message,
        messageCreator : creator,
        messageReceiver : receiver,
        sendTime : new Date()
      })
      await this.messageRepository.save(message);
      const receiverSocket = this.connectedClients.get(receiver.id);
      
      if (!receiverSocket){
        throw new WsException(WsExceptionMessages.receiverNotConnected)
    }
    receiverSocket.emit(socketEmits.newMessage, message);
  }


async findMessagesById(userId1 : number, userId2 : number) {
  const secondUser = await this.userRepository.findOne({
    where : { id : userId2 } 
  });
  if (!secondUser) {
    throw new WsException(WsExceptionMessages.notFound)
  }
  const messages = await this.messageRepository.find({
    select: ['content', 'sendTime'],
    where: [
      {
        messageCreator: { id: userId1 },
        messageReceiver: { id: userId2 },
      },
      {
        messageCreator: { id: userId2 },
        messageReceiver: { id: userId1 },
      },
    ],
    order: {
      sendTime: 'ASC',
    },
  });
  return messages;
}

  

  async deleteChat (creator : User, id : number) {
    const deletedUser = await this.userRepository.findOne({
      where : { id : id }
    })
    if (!deletedUser) {
      throw new WsException(WsExceptionMessages.notFound)
    }
    const query = this.messageRepository
    .createQueryBuilder()
    .delete()
    .where('messageCreatorId = :creatorId AND messageReceiverId = :deletedUserId OR (messageReceiverId = :creatorId AND messageCreatorId = :deletedUserId)', {
      creatorId: creator.id,
      deletedUserId: id,
    })
    await query.execute();  
  }
}