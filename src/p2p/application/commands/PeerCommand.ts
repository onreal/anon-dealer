import { Peer, PeerConnection, PeerInvitation, ItemVisibility, P2POrder, AccessLevel, VisibilityType, P2POrderStatus, ConnectionStatus } from '../../domain/models/Peer';
import { PeerRepository } from '../../infrastructure/repositories/PeerRepository';
import { PeerConnectionRepository } from '../../infrastructure/repositories/PeerConnectionRepository';
import { PeerInvitationRepository } from '../../infrastructure/repositories/PeerInvitationRepository';
import { ItemVisibilityRepository } from '../../infrastructure/repositories/ItemVisibilityRepository';
import { P2POrderRepository } from '../../infrastructure/repositories/P2POrderRepository';

export class PeerCommand {
  private peerRepository: PeerRepository;
  private connectionRepository: PeerConnectionRepository;
  private invitationRepository: PeerInvitationRepository;
  private visibilityRepository: ItemVisibilityRepository;
  private orderRepository: P2POrderRepository;

  constructor() {
    this.peerRepository = PeerRepository.getInstance();
    this.connectionRepository = PeerConnectionRepository.getInstance();
    this.invitationRepository = PeerInvitationRepository.getInstance();
    this.visibilityRepository = ItemVisibilityRepository.getInstance();
    this.orderRepository = P2POrderRepository.getInstance();
  }

  // Peer Management Commands
  async createPeer(name: string): Promise<Peer> {
    const peerId = this.generatePeerId();
    const keyPair = await this.generateKeyPair();
    
    const peer: Peer = {
      peerId,
      name,
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
      isOnline: true,
      lastSeen: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.peerRepository.setCurrentPeer(peer);
    return peer;
  }

  async getCurrentPeer(): Promise<Peer | null> {
    return await this.peerRepository.getCurrentPeer();
  }

  async updatePeerStatus(isOnline: boolean): Promise<void> {
    const currentPeer = await this.getCurrentPeer();
    if (currentPeer) {
      await this.peerRepository.updatePeerStatus(currentPeer.peerId, isOnline);
    }
  }

  // Invitation Management Commands
  async createInvitation(accessLevel: AccessLevel, expiresInHours: number = 24): Promise<PeerInvitation> {
    const currentPeer = await this.getCurrentPeer();
    if (!currentPeer) {
      throw new Error('No current peer found. Please create a peer first.');
    }

    const invitationId = this.generateInvitationId();
    const invitationCode = this.generateInvitationCode();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const invitation: PeerInvitation = {
      invitationId,
      fromPeerId: currentPeer.peerId,
      invitationCode,
      accessLevel,
      expiresAt,
      isUsed: false,
      createdAt: new Date()
    };

    await this.invitationRepository.add(invitation);
    return invitation;
  }

  async acceptInvitation(invitationCode: string, peerName: string): Promise<PeerConnection> {
    const invitation = await this.invitationRepository.getInvitationByCode(invitationCode);
    
    if (!invitation) {
      throw new Error('Invalid invitation code');
    }

    if (invitation.isUsed) {
      throw new Error('Invitation has already been used');
    }

    if (invitation.expiresAt < new Date()) {
      throw new Error('Invitation has expired');
    }

    const currentPeer = await this.getCurrentPeer();
    if (!currentPeer) {
      throw new Error('No current peer found. Please create a peer first.');
    }

    // Mark invitation as used
    await this.invitationRepository.markInvitationAsUsed(invitation.invitationId, currentPeer.peerId);

    // Create connection
    const connectionId = this.generateConnectionId();
    const connection: PeerConnection = {
      connectionId,
      peerAId: invitation.fromPeerId,
      peerBId: currentPeer.peerId,
      invitationCode,
      status: ConnectionStatus.ACTIVE,
      accessLevel: invitation.accessLevel,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivity: new Date()
    };

    await this.connectionRepository.add(connection);
    return connection;
  }

  // Connection Management Commands
  async getConnections(): Promise<PeerConnection[]> {
    const currentPeer = await this.getCurrentPeer();
    if (!currentPeer) return [];
    
    return await this.connectionRepository.getConnectionsByPeerId(currentPeer.peerId);
  }

  async getActiveConnections(): Promise<PeerConnection[]> {
    const currentPeer = await this.getCurrentPeer();
    if (!currentPeer) return [];
    
    return await this.connectionRepository.getActiveConnectionsByPeerId(currentPeer.peerId);
  }

  async disconnectPeer(connectionId: string): Promise<void> {
    await this.connectionRepository.updateConnectionStatus(connectionId, ConnectionStatus.DISCONNECTED);
  }

  // Item Visibility Management Commands
  async setItemVisibility(
    itemId: string, 
    visibilityType: VisibilityType, 
    allowedPeerIds: string[] = [],
    accessLevel: AccessLevel = AccessLevel.VIEW
  ): Promise<ItemVisibility> {
    const currentPeer = await this.getCurrentPeer();
    if (!currentPeer) {
      throw new Error('No current peer found');
    }

    const visibilityId = this.generateVisibilityId();
    const visibility: ItemVisibility = {
      visibilityId,
      itemId,
      ownerPeerId: currentPeer.peerId,
      visibilityType,
      allowedPeerIds,
      accessLevel,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.visibilityRepository.add(visibility);
    return visibility;
  }

  async getVisibleItems(): Promise<string[]> {
    const currentPeer = await this.getCurrentPeer();
    if (!currentPeer) return [];

    return await this.visibilityRepository.getVisibleItemsForPeer(currentPeer.peerId);
  }

  async shareItemWithPeer(itemId: string, peerId: string): Promise<void> {
    await this.visibilityRepository.addPeerToItemVisibility(itemId, peerId);
  }

  async unshareItemWithPeer(itemId: string, peerId: string): Promise<void> {
    await this.visibilityRepository.removePeerFromItemVisibility(itemId, peerId);
  }

  // P2P Order Management Commands
  async createP2POrder(
    toPeerId: string,
    itemId: string,
    quantity: number,
    price: number,
    notes?: string
  ): Promise<P2POrder> {
    const currentPeer = await this.getCurrentPeer();
    if (!currentPeer) {
      throw new Error('No current peer found');
    }

    // Check if peer has permission to order from this peer
    const connection = await this.connectionRepository.getConnectionBetweenPeers(currentPeer.peerId, toPeerId);
    if (!connection || connection.status !== 'active') {
      throw new Error('No active connection with this peer');
    }

    const orderId = this.generateOrderId();
    const order: P2POrder = {
      orderId,
      fromPeerId: currentPeer.peerId,
      toPeerId,
      itemId,
      quantity,
      price,
      status: P2POrderStatus.PENDING,
      notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.orderRepository.add(order);
    return order;
  }

  async getP2POrders(): Promise<P2POrder[]> {
    const currentPeer = await this.getCurrentPeer();
    if (!currentPeer) return [];

    return await this.orderRepository.getOrdersByPeerId(currentPeer.peerId);
  }

  async updateOrderStatus(orderId: string, status: P2POrderStatus): Promise<void> {
    await this.orderRepository.updateOrderStatus(orderId, status);
  }

  async getPendingOrders(): Promise<P2POrder[]> {
    const currentPeer = await this.getCurrentPeer();
    if (!currentPeer) return [];

    return await this.orderRepository.getPendingOrdersForPeer(currentPeer.peerId);
  }

  // Utility Methods
  private generatePeerId(): string {
    return 'peer_' + Math.random().toString(36).substr(2, 9);
  }

  private generateInvitationId(): string {
    return 'inv_' + Math.random().toString(36).substr(2, 9);
  }

  private generateInvitationCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'AD-';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    result += '-';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateConnectionId(): string {
    return 'conn_' + Math.random().toString(36).substr(2, 9);
  }

  private generateVisibilityId(): string {
    return 'vis_' + Math.random().toString(36).substr(2, 9);
  }

  private generateOrderId(): string {
    return 'p2p_order_' + Math.random().toString(36).substr(2, 9);
  }

  private async generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    // In a real implementation, this would generate actual cryptographic keys
    // For now, we'll generate mock keys
    return {
      publicKey: 'pub_' + Math.random().toString(36).substr(2, 32),
      privateKey: 'priv_' + Math.random().toString(36).substr(2, 32)
    };
  }
}
