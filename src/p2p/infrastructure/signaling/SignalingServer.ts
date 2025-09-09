import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';

interface Peer {
  id: string;
  name: string;
  publicKey: string;
  ws: WebSocket;
  lastSeen: Date;
}

interface SignalingMessage {
  type: 'register' | 'offer' | 'answer' | 'ice-candidate' | 'peer-list' | 'ping';
  from?: string;
  to?: string;
  peerId?: string;
  name?: string;
  publicKey?: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  peers?: Peer[];
}

export class SignalingServer {
  private wss: WebSocketServer;
  private peers: Map<string, Peer> = new Map();
  private port: number;

  constructor(port: number = 8080) {
    this.port = port;
    this.wss = new WebSocketServer({ port });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      console.log('New peer connected');
      
      ws.on('message', (data: Buffer) => {
        try {
          const message: SignalingMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });

      ws.on('close', () => {
        this.handlePeerDisconnect(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Send ping every 30 seconds to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        } else {
          clearInterval(pingInterval);
        }
      }, 30000);
    });

    console.log(`Signaling server running on port ${this.port}`);
  }

  private handleMessage(ws: WebSocket, message: SignalingMessage): void {
    switch (message.type) {
      case 'register':
        this.handlePeerRegistration(ws, message);
        break;
      case 'offer':
        this.handleOffer(message);
        break;
      case 'answer':
        this.handleAnswer(message);
        break;
      case 'ice-candidate':
        this.handleIceCandidate(message);
        break;
      case 'peer-list':
        this.handlePeerListRequest(ws);
        break;
      case 'ping':
        this.handlePing(ws);
        break;
    }
  }

  private handlePeerRegistration(ws: WebSocket, message: SignalingMessage): void {
    if (!message.peerId || !message.name || !message.publicKey) {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid registration data' }));
      return;
    }

    const peer: Peer = {
      id: message.peerId,
      name: message.name,
      publicKey: message.publicKey,
      ws: ws,
      lastSeen: new Date()
    };

    this.peers.set(message.peerId, peer);
    console.log(`Peer registered: ${message.name} (${message.peerId})`);

    // Send confirmation
    ws.send(JSON.stringify({ 
      type: 'registered', 
      peerId: message.peerId,
      message: 'Successfully registered' 
    }));

    // Broadcast updated peer list to all connected peers
    this.broadcastPeerList();
  }

  private handleOffer(message: SignalingMessage): void {
    if (!message.from || !message.to) return;

    const targetPeer = this.peers.get(message.to);
    if (targetPeer && targetPeer.ws.readyState === WebSocket.OPEN) {
      targetPeer.ws.send(JSON.stringify({
        type: 'offer',
        from: message.from,
        to: message.to,
        offer: message.offer
      }));
    }
  }

  private handleAnswer(message: SignalingMessage): void {
    if (!message.from || !message.to) return;

    const targetPeer = this.peers.get(message.to);
    if (targetPeer && targetPeer.ws.readyState === WebSocket.OPEN) {
      targetPeer.ws.send(JSON.stringify({
        type: 'answer',
        from: message.from,
        to: message.to,
        answer: message.answer
      }));
    }
  }

  private handleIceCandidate(message: SignalingMessage): void {
    if (!message.from || !message.to) return;

    const targetPeer = this.peers.get(message.to);
    if (targetPeer && targetPeer.ws.readyState === WebSocket.OPEN) {
      targetPeer.ws.send(JSON.stringify({
        type: 'ice-candidate',
        from: message.from,
        to: message.to,
        candidate: message.candidate
      }));
    }
  }

  private handlePeerListRequest(ws: WebSocket): void {
    const peerList = Array.from(this.peers.values()).map(peer => ({
      id: peer.id,
      name: peer.name,
      publicKey: peer.publicKey,
      lastSeen: peer.lastSeen
    }));

    ws.send(JSON.stringify({
      type: 'peer-list',
      peers: peerList
    }));
  }

  private handlePing(ws: WebSocket): void {
    ws.send(JSON.stringify({ type: 'pong' }));
  }

  private handlePeerDisconnect(ws: WebSocket): void {
    // Find and remove the disconnected peer
    for (const [peerId, peer] of this.peers.entries()) {
      if (peer.ws === ws) {
        this.peers.delete(peerId);
        console.log(`Peer disconnected: ${peer.name} (${peerId})`);
        this.broadcastPeerList();
        break;
      }
    }
  }

  private broadcastPeerList(): void {
    const peerList = Array.from(this.peers.values()).map(peer => ({
      id: peer.id,
      name: peer.name,
      publicKey: peer.publicKey,
      lastSeen: peer.lastSeen
    }));

    const message = JSON.stringify({
      type: 'peer-list',
      peers: peerList
    });

    // Broadcast to all connected peers
    for (const peer of this.peers.values()) {
      if (peer.ws.readyState === WebSocket.OPEN) {
        peer.ws.send(message);
      }
    }
  }

  // Public methods for server management
  getConnectedPeers(): Peer[] {
    return Array.from(this.peers.values());
  }

  getPeerCount(): number {
    return this.peers.size;
  }

  close(): void {
    this.wss.close();
  }
}

// Export a function to start the server
export function startSignalingServer(port: number = 8080): SignalingServer {
  return new SignalingServer(port);
}

// If running this file directly, start the server
if (require.main === module) {
  const server = startSignalingServer();
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down signaling server...');
    server.close();
    process.exit(0);
  });
}
