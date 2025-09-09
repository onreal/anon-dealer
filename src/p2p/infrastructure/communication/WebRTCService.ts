import { Peer, PeerConnection } from '../../domain/models/Peer';

export interface P2PMessage {
  type: 'order' | 'inventory_update' | 'status_update' | 'ping' | 'pong';
  data: any;
  timestamp: Date;
  fromPeerId: string;
  toPeerId: string;
}

export class WebRTCService {
  private static instance: WebRTCService;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private dataChannels: Map<string, RTCDataChannel> = new Map();
  private messageHandlers: Map<string, (message: P2PMessage) => void> = new Map();
  private currentPeer: Peer | null = null;
  private signalingServer: string = 'ws://localhost:8080'; // Default signaling server
  private ws: WebSocket | null = null;

  private constructor() {}

  static getInstance(): WebRTCService {
    if (!WebRTCService.instance) {
      WebRTCService.instance = new WebRTCService();
    }
    return WebRTCService.instance;
  }

  // Initialization
  async initialize(peer: Peer, signalingServer?: string): Promise<void> {
    this.currentPeer = peer;
    if (signalingServer) {
      this.signalingServer = signalingServer;
    }
    
    await this.connectToSignalingServer();
  }

  private async connectToSignalingServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.signalingServer);
        
        this.ws.onopen = () => {
          console.log('Connected to signaling server');
          this.registerPeer();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleSignalingMessage(JSON.parse(event.data));
        };

        this.ws.onerror = (error) => {
          console.error('Signaling server error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('Disconnected from signaling server');
          // Attempt to reconnect after 5 seconds
          setTimeout(() => this.connectToSignalingServer(), 5000);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private registerPeer(): void {
    if (this.ws && this.currentPeer) {
      this.ws.send(JSON.stringify({
        type: 'register',
        peerId: this.currentPeer.peerId,
        name: this.currentPeer.name,
        publicKey: this.currentPeer.publicKey
      }));
    }
  }

  // Peer Connection Management
  async connectToPeer(targetPeerId: string): Promise<void> {
    if (!this.currentPeer) {
      throw new Error('No current peer found');
    }

    const connectionId = `${this.currentPeer.peerId}_${targetPeerId}`;
    
    if (this.peerConnections.has(connectionId)) {
      console.log('Connection already exists');
      return;
    }

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    this.peerConnections.set(connectionId, peerConnection);

    // Set up data channel
    const dataChannel = peerConnection.createDataChannel('p2p-messages', {
      ordered: true
    });

    this.setupDataChannel(dataChannel, targetPeerId);
    this.setupPeerConnection(peerConnection, targetPeerId);

    // Create offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // Send offer through signaling server
    this.sendSignalingMessage({
      type: 'offer',
      from: this.currentPeer.peerId,
      to: targetPeerId,
      offer: offer
    });
  }

  private setupDataChannel(dataChannel: RTCDataChannel, targetPeerId: string): void {
    dataChannel.onopen = () => {
      console.log(`Data channel opened with peer ${targetPeerId}`);
      this.dataChannels.set(targetPeerId, dataChannel);
    };

    dataChannel.onmessage = (event) => {
      try {
        const message: P2PMessage = JSON.parse(event.data);
        this.handleP2PMessage(message);
      } catch (error) {
        console.error('Error parsing P2P message:', error);
      }
    };

    dataChannel.onerror = (error) => {
      console.error('Data channel error:', error);
    };
  }

  private setupPeerConnection(peerConnection: RTCPeerConnection, targetPeerId: string): void {
    peerConnection.ondatachannel = (event) => {
      const dataChannel = event.channel;
      this.setupDataChannel(dataChannel, targetPeerId);
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.currentPeer) {
        this.sendSignalingMessage({
          type: 'ice-candidate',
          from: this.currentPeer.peerId,
          to: targetPeerId,
          candidate: event.candidate
        });
      }
    };

    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state with ${targetPeerId}:`, peerConnection.connectionState);
      
      if (peerConnection.connectionState === 'disconnected' || 
          peerConnection.connectionState === 'failed') {
        this.cleanupConnection(targetPeerId);
      }
    };
  }

  // Signaling Server Communication
  private sendSignalingMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private async handleSignalingMessage(message: any): Promise<void> {
    switch (message.type) {
      case 'offer':
        await this.handleOffer(message);
        break;
      case 'answer':
        await this.handleAnswer(message);
        break;
      case 'ice-candidate':
        await this.handleIceCandidate(message);
        break;
      case 'peer-list':
        this.handlePeerList(message.peers);
        break;
    }
  }

  private async handleOffer(message: any): Promise<void> {
    if (!this.currentPeer) return;

    const connectionId = `${message.from}_${this.currentPeer.peerId}`;
    let peerConnection = this.peerConnections.get(connectionId);

    if (!peerConnection) {
      peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      this.peerConnections.set(connectionId, peerConnection);
      this.setupPeerConnection(peerConnection, message.from);
    }

    await peerConnection.setRemoteDescription(message.offer);

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    this.sendSignalingMessage({
      type: 'answer',
      from: this.currentPeer.peerId,
      to: message.from,
      answer: answer
    });
  }

  private async handleAnswer(message: any): Promise<void> {
    const connectionId = `${this.currentPeer?.peerId}_${message.from}`;
    const peerConnection = this.peerConnections.get(connectionId);

    if (peerConnection) {
      await peerConnection.setRemoteDescription(message.answer);
    }
  }

  private async handleIceCandidate(message: any): Promise<void> {
    const connectionId = `${this.currentPeer?.peerId}_${message.from}`;
    const peerConnection = this.peerConnections.get(connectionId);

    if (peerConnection) {
      await peerConnection.addIceCandidate(message.candidate);
    }
  }

  private handlePeerList(peers: any[]): void {
    console.log('Available peers:', peers);
    // Emit peer list event for UI
    this.emit('peer-list', peers);
  }

  // P2P Message Handling
  private handleP2PMessage(message: P2PMessage): void {
    console.log('Received P2P message:', message);
    
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    }
  }

  async sendMessage(toPeerId: string, message: P2PMessage): Promise<void> {
    const dataChannel = this.dataChannels.get(toPeerId);
    
    if (dataChannel && dataChannel.readyState === 'open') {
      dataChannel.send(JSON.stringify(message));
    } else {
      console.error('No open data channel to peer:', toPeerId);
    }
  }

  // Event System
  on(event: string, handler: (data: any) => void): void {
    this.messageHandlers.set(event, handler);
  }

  off(event: string): void {
    this.messageHandlers.delete(event);
  }

  private emit(event: string, data: any): void {
    const handler = this.messageHandlers.get(event);
    if (handler) {
      handler(data);
    }
  }

  // Cleanup
  private cleanupConnection(peerId: string): void {
    const connectionId = `${this.currentPeer?.peerId}_${peerId}`;
    const peerConnection = this.peerConnections.get(connectionId);
    
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(connectionId);
    }

    this.dataChannels.delete(peerId);
  }

  async disconnectFromPeer(peerId: string): Promise<void> {
    this.cleanupConnection(peerId);
  }

  async disconnect(): Promise<void> {
    // Close all peer connections
    for (const [connectionId, peerConnection] of this.peerConnections) {
      peerConnection.close();
    }
    this.peerConnections.clear();
    this.dataChannels.clear();

    // Close signaling server connection
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Utility Methods
  getConnectedPeers(): string[] {
    return Array.from(this.dataChannels.keys());
  }

  isConnectedToPeer(peerId: string): boolean {
    const dataChannel = this.dataChannels.get(peerId);
    return dataChannel ? dataChannel.readyState === 'open' : false;
  }
}
