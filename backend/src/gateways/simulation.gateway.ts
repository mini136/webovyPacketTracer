import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface PacketData {
  sourceDeviceId: string;
  targetDeviceId: string;
  protocol: string;
  payload: any;
  topologyId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SimulationGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinTopology')
  handleJoinTopology(
    @MessageBody() topologyId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(topologyId);
    return { event: 'joinedTopology', data: topologyId };
  }

  @SubscribeMessage('sendPacket')
  handleSendPacket(@MessageBody() packetData: PacketData) {
    // Emit packet animation to all clients in the topology
    this.server.to(packetData.topologyId).emit('packetSent', packetData);
    
    // Here you would implement actual packet routing logic
    // For now, just simulate packet delivery
    setTimeout(() => {
      this.server.to(packetData.topologyId).emit('packetDelivered', {
        ...packetData,
        status: 'delivered',
      });
    }, 1000);

    return { event: 'packetQueued', data: packetData };
  }

  @SubscribeMessage('ping')
  handlePing(
    @MessageBody() data: { sourceId: string; targetIp: string; topologyId: string },
  ) {
    // Simulate ping command
    this.server.to(data.topologyId).emit('pingStarted', data);
    
    // Simulate ICMP echo request/reply
    setTimeout(() => {
      this.server.to(data.topologyId).emit('pingResult', {
        ...data,
        rtt: Math.random() * 50 + 10, // Random RTT between 10-60ms
        success: true,
      });
    }, 1500);

    return { event: 'pingQueued', data };
  }
}
