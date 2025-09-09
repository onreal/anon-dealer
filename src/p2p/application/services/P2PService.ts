import { PeerCommand } from '../commands/PeerCommand';
import { WebRTCService } from '../../infrastructure/communication/WebRTCService';
import { Peer, PeerConnection, P2POrder, ItemVisibility, VisibilityType, AccessLevel } from '../../domain/models/Peer';
import { useP2PConfig } from '../../../composables/P2PConfig';

export class P2PService {
  private static instance: P2PService;
  private peerCommand: PeerCommand;
  private webRTCService: WebRTCService;
  private isInitialized: boolean = false;
  private p2pConfig = useP2PConfig();

  private constructor() {
    this.peerCommand = new PeerCommand();
    this.webRTCService = WebRTCService.getInstance();
  }

  static getInstance(): P2PService {
    if (!P2PService.instance) {
      P2PService.instance = new P2PService();
    }
    return P2PService.instance;
  }

  // Initialization
  async initialize(signalingServer?: string): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if P2P is enabled
      if (!this.p2pConfig.isP2PEnabled.value) {
        return;
      }

      const currentPeer = await this.peerCommand.getCurrentPeer();
      if (currentPeer) {
        // Use configured signaling server or fallback to parameter
        const serverUrl = signalingServer || this.p2pConfig.getWebSocketUrl();
        if (serverUrl) {
          await this.webRTCService.initialize(currentPeer, serverUrl);
          this.setupMessageHandlers();
          this.isInitialized = true;
        } else {
          console.warn('No signaling server URL configured');
        }
      }
    } catch (error) {
      console.error('Failed to initialize P2P service:', error);
      throw error;
    }
  }

  // Peer Management
  async createPeer(name: string): Promise<Peer> {
    const peer = await this.peerCommand.createPeer(name);
    await this.webRTCService.initialize(peer);
    this.setupMessageHandlers();
    this.isInitialized = true;
    return peer;
  }

  async getCurrentPeer(): Promise<Peer | null> {
    return await this.peerCommand.getCurrentPeer();
  }

  async updatePeerStatus(isOnline: boolean): Promise<void> {
    await this.peerCommand.updatePeerStatus(isOnline);
  }

  // Invitation Management
  async createInvitation(accessLevel: AccessLevel, expiresInHours: number = 24): Promise<string> {
    const invitation = await this.peerCommand.createInvitation(accessLevel, expiresInHours);
    return invitation.invitationCode;
  }

  async acceptInvitation(invitationCode: string): Promise<PeerConnection> {
    const currentPeer = await this.getCurrentPeer();
    if (!currentPeer) {
      throw new Error('No current peer found');
    }

    const connection = await this.peerCommand.acceptInvitation(invitationCode, currentPeer.name);
    
    // Establish WebRTC connection
    const otherPeerId = connection.peerAId === currentPeer.peerId ? connection.peerBId : connection.peerAId;
    await this.webRTCService.connectToPeer(otherPeerId);
    
    return connection;
  }

  // Connection Management
  async getConnections(): Promise<PeerConnection[]> {
    return await this.peerCommand.getConnections();
  }

  async getActiveConnections(): Promise<PeerConnection[]> {
    return await this.peerCommand.getActiveConnections();
  }

  async disconnectPeer(connectionId: string): Promise<void> {
    await this.peerCommand.disconnectPeer(connectionId);
    
    // Find the peer ID to disconnect from
    const connections = await this.getConnections();
    const connection = connections.find(conn => conn.connectionId === connectionId);
    if (connection) {
      const currentPeer = await this.getCurrentPeer();
      if (currentPeer) {
        const otherPeerId = connection.peerAId === currentPeer.peerId ? connection.peerBId : connection.peerAId;
        await this.webRTCService.disconnectFromPeer(otherPeerId);
      }
    }
  }

  // Item Visibility Management
  async setItemVisibility(
    itemId: string, 
    visibilityType: VisibilityType, 
    allowedPeerIds: string[] = [],
    accessLevel: AccessLevel = AccessLevel.VIEW
  ): Promise<ItemVisibility> {
    return await this.peerCommand.setItemVisibility(itemId, visibilityType, allowedPeerIds, accessLevel);
  }

  async getVisibleItems(): Promise<string[]> {
    return await this.peerCommand.getVisibleItems();
  }

  async shareItemWithPeer(itemId: string, peerId: string): Promise<void> {
    await this.peerCommand.shareItemWithPeer(itemId, peerId);
  }

  async unshareItemWithPeer(itemId: string, peerId: string): Promise<void> {
    await this.peerCommand.unshareItemWithPeer(itemId, peerId);
  }

  // P2P Order Management
  async createP2POrder(
    toPeerId: string,
    itemId: string,
    quantity: number,
    price: number,
    notes?: string
  ): Promise<P2POrder> {
    const order = await this.peerCommand.createP2POrder(toPeerId, itemId, quantity, price, notes);
    
    // Send order notification via WebRTC
    await this.webRTCService.sendMessage(toPeerId, {
      type: 'order',
      data: order,
      timestamp: new Date(),
      fromPeerId: (await this.getCurrentPeer())?.peerId || '',
      toPeerId: toPeerId
    });
    
    return order;
  }

  async getP2POrders(): Promise<P2POrder[]> {
    return await this.peerCommand.getP2POrders();
  }

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    await this.peerCommand.updateOrderStatus(orderId, status as any);
    
    // Send status update via WebRTC
    const order = (await this.getP2POrders()).find(o => o.orderId === orderId);
    if (order) {
      const otherPeerId = order.fromPeerId === (await this.getCurrentPeer())?.peerId ? order.toPeerId : order.fromPeerId;
      await this.webRTCService.sendMessage(otherPeerId, {
        type: 'status_update',
        data: { orderId, status },
        timestamp: new Date(),
        fromPeerId: (await this.getCurrentPeer())?.peerId || '',
        toPeerId: otherPeerId
      });
    }
  }

  // WebRTC Connection Management
  async connectToPeer(peerId: string): Promise<void> {
    await this.webRTCService.connectToPeer(peerId);
  }

  getConnectedPeers(): string[] {
    return this.webRTCService.getConnectedPeers();
  }

  isConnectedToPeer(peerId: string): boolean {
    return this.webRTCService.isConnectedToPeer(peerId);
  }

  // Event Handling
  on(event: string, handler: (data: any) => void): void {
    this.webRTCService.on(event, handler);
  }

  off(event: string): void {
    this.webRTCService.off(event);
  }

  // Private Methods
  private setupMessageHandlers(): void {
    // Handle incoming P2P messages
    this.webRTCService.on('order', (message) => {
      // Emit event for UI to handle
      this.emit('p2p-order-received', message.data);
    });

    this.webRTCService.on('status_update', (message) => {
      // Emit event for UI to handle
      this.emit('p2p-status-updated', message.data);
    });

    this.webRTCService.on('inventory_update', (message) => {
      // Emit event for UI to handle
      this.emit('p2p-inventory-updated', message.data);
    });
  }

  private emit(event: string, data: any): void {
    // In a real implementation, you'd use a proper event emitter
    // For now, we'll just log the event
  }

  // Cleanup
  async disconnect(): Promise<void> {
    await this.webRTCService.disconnect();
    this.isInitialized = false;
  }
}
