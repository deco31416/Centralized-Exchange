import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AuthClient } from '../shared/clients/auth.client';
import { TunnelService, SessionView } from './tunnel.service';

/* ─── Types ───────────────────────────────────── */

interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    email?: string;
    sessionId?: string;
  };
}

/**
 * Vista enmascarada que se envía a un participante.
 * Cada uno ve su propio auth en detalle y el del otro con asteriscos.
 */
function maskSessionForUser(
  session: SessionView,
  forUserId: string,
): SessionView & { yourRole: 'creator' | 'joiner' } {
  const isCreator = session.creator.userId === forUserId;
  return {
    ...session,
    yourRole: isCreator ? 'creator' : 'joiner',
  };
}

/* ─── Gateway ─────────────────────────────────── */

@WebSocketGateway({
  namespace: '/tunnel',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class TunnelGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(TunnelGateway.name);

  /** Map: userId → Set<socketId>  (un usuario puede tener múltiples tabs) */
  private readonly userSockets = new Map<string, Set<string>>();

  /** Map: socketId → userId */
  private readonly socketUsers = new Map<string, string>();

  constructor(
    private readonly authClient: AuthClient,
    private readonly tunnelService: TunnelService,
  ) {}

  /* ─── Connection lifecycle ─────────────────── */

  async handleConnection(client: AuthenticatedSocket) {
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      this.logger.warn(`Connection rejected: no token (${client.id})`);
      client.emit('error', { message: 'AUTH_REQUIRED' });
      client.disconnect(true);
      return;
    }

    const user = await this.authClient.validateToken(token);
    if (!user) {
      this.logger.warn(`Connection rejected: invalid token (${client.id})`);
      client.emit('error', { message: 'AUTH_INVALID' });
      client.disconnect(true);
      return;
    }

    // Store user info
    client.data.userId = user.userId;
    client.data.email = user.email;

    // Track socket
    if (!this.userSockets.has(user.userId)) {
      this.userSockets.set(user.userId, new Set());
    }
    this.userSockets.get(user.userId)!.add(client.id);
    this.socketUsers.set(client.id, user.userId);

    this.logger.log(
      `Connected: ${user.userId} (socket: ${client.id})`,
    );

    client.emit('connected', { userId: user.userId });
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = this.socketUsers.get(client.id);
    if (userId) {
      const sockets = this.userSockets.get(userId);
      sockets?.delete(client.id);
      if (sockets?.size === 0) this.userSockets.delete(userId);
      this.socketUsers.delete(client.id);
    }

    this.logger.log(`Disconnected: ${userId ?? 'unknown'} (${client.id})`);
  }

  /* ─── Helpers: emit to user ────────────────── */

  private emitToUser(userId: string, event: string, data: any) {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;
    for (const sid of sockets) {
      this.server.to(sid).emit(event, data);
    }
  }

  private emitToSession(session: SessionView, event: string, data: any) {
    this.emitToUser(session.creator.userId, event, data);
    if (session.joiner) {
      this.emitToUser(session.joiner.userId, event, data);
    }
  }

  private broadcastSessionState(session: SessionView) {
    // Enviar a cada participante su vista personalizada
    this.emitToUser(
      session.creator.userId,
      'session:state',
      maskSessionForUser(session, session.creator.userId),
    );
    if (session.joiner) {
      this.emitToUser(
        session.joiner.userId,
        'session:state',
        maskSessionForUser(session, session.joiner.userId),
      );
    }
  }

  /* ─── Events ───────────────────────────────── */

  /**
   * Cobrador crea una nueva sesión de túnel.
   */
  @SubscribeMessage('session:create')
  async handleCreate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    body: {
      currency: string;
      amountMinorUnits: string;
      concept?: string;
      requiredMethods?: string[];
    },
  ) {
    const session = await this.tunnelService.createSession({
      userId: client.data.userId,
      email: client.data.email,
      currency: body.currency,
      amountMinorUnits: body.amountMinorUnits,
      concept: body.concept,
      requiredMethods: body.requiredMethods,
    });

    client.data.sessionId = session.sessionId;

    // Unir al room de la sesión
    client.join(session.sessionId);

    client.emit('session:created', maskSessionForUser(session, client.data.userId));

    this.logger.log(
      `Session created: ${session.sessionId} invite=${session.inviteCode}`,
    );
  }

  /**
   * Pagador se une con el código de invitación.
   */
  @SubscribeMessage('session:join')
  async handleJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: { inviteCode: string },
  ) {
    const result = await this.tunnelService.joinSession({
      inviteCode: body.inviteCode,
      userId: client.data.userId,
      email: client.data.email,
    });

    if ('error' in result) {
      client.emit('session:error', { error: result.error });
      return;
    }

    client.data.sessionId = result.sessionId;
    client.join(result.sessionId);

    // Broadcast a ambos que la sesión está activa
    this.broadcastSessionState(result);

    this.emitToSession(result, 'session:joined', {
      joinedUserId: client.data.userId,
    });

    this.logger.log(
      `Session ${result.sessionId}: ${client.data.userId} joined`,
    );
  }

  /**
   * Solicitar OTP de email (antes de verificarlo).
   */
  @SubscribeMessage('auth:request-otp')
  async handleRequestOtp(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: { sessionId: string },
  ) {
    const result = await this.tunnelService.requestEmailOtp(
      body.sessionId,
      client.data.userId,
      client.data.email,
    );

    client.emit('auth:otp-requested', result);
  }

  /**
   * Participante envía un método de autorización.
   * El tunnel lo verifica y broadcast el resultado enmascarado.
   */
  @SubscribeMessage('auth:submit')
  async handleAuthSubmit(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    body: {
      sessionId: string;
      method: 'pin' | 'dynamicKey' | 'emailOtp';
      value: string;
    },
  ) {
    const result = await this.tunnelService.verifyAuthMethod({
      sessionId: body.sessionId,
      userId: client.data.userId,
      method: body.method,
      value: body.value,
    });

    if ('error' in result) {
      client.emit('auth:error', { error: result.error });
      return;
    }

    // Enviar resultado al que envió (detallado)
    client.emit('auth:result', {
      method: body.method,
      verified: result.verified,
      participantFullyAuthorized: result.participantFullyAuthorized,
      bothAuthorized: result.bothAuthorized,
    });

    // Broadcast estado actualizado a ambos
    const session = await this.tunnelService.getSession(body.sessionId);
    if (session) {
      this.broadcastSessionState(session);

      // Notificar al otro participante que hubo un cambio de auth
      const otherUserId =
        session.creator.userId === client.data.userId
          ? session.joiner?.userId
          : session.creator.userId;

      if (otherUserId) {
        this.emitToUser(otherUserId, 'auth:partner-update', {
          method: body.method,
          state: result.verified ? 'verified' : 'failed',
          // No se envía el valor real, solo asteriscos
          masked: '••••••',
        });
      }

      // Si ambos están autorizados → ejecutar transferencia automáticamente
      if (result.bothAuthorized) {
        await this.handleExecuteTransfer(body.sessionId, session);
      }
    }
  }

  /**
   * Ejecutar la transferencia cuando ambos están autorizados.
   */
  private async handleExecuteTransfer(
    sessionId: string,
    session: SessionView,
  ) {
    // Notificar que la transferencia está en proceso
    this.emitToSession(session, 'transfer:executing', {
      sessionId,
      status: 'processing',
    });

    const result = await this.tunnelService.executeTransfer(sessionId);

    if (result.success) {
      const updatedSession = await this.tunnelService.getSession(sessionId);
      if (updatedSession) {
        this.broadcastSessionState(updatedSession);
      }

      this.emitToSession(session, 'transfer:completed', {
        sessionId,
        txId: result.txId,
        correlationId: result.correlationId,
        currency: session.currency,
        amountMinorUnits: session.amountMinorUnits,
        concept: session.concept,
      });

      this.logger.log(`Transfer completed in session ${sessionId}`);
    } else {
      this.emitToSession(session, 'transfer:failed', {
        sessionId,
        reason: result.reason,
      });

      this.logger.warn(
        `Transfer failed in session ${sessionId}: ${result.reason}`,
      );
    }
  }

  /**
   * Cancelar una sesión activa.
   */
  @SubscribeMessage('session:cancel')
  async handleCancel(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: { sessionId: string },
  ) {
    const session = await this.tunnelService.getSession(body.sessionId);
    const result = await this.tunnelService.cancelSession(
      body.sessionId,
      client.data.userId,
    );

    if (result.success && session) {
      this.emitToSession(session, 'session:cancelled', {
        sessionId: body.sessionId,
        cancelledBy: client.data.userId,
      });
    } else {
      client.emit('session:error', { error: 'CANCEL_FAILED' });
    }
  }
}
