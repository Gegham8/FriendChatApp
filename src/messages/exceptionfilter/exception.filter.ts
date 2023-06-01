import { ArgumentsHost, Catch } from "@nestjs/common";
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";

@Catch(WsException)
export class WebsocketExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: WsException , host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    const error = exception instanceof WsException ? exception.getError() : exception;
    client.emit('error', {
      message: error instanceof WsException ? error.message : error,
    });
  }
}