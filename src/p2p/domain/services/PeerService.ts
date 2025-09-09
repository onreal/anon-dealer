import { Peer, PeerConnection, PeerInvitation, ItemVisibility, P2POrder, ConnectionStatus, AccessLevel, VisibilityType, P2POrderStatus } from '../models/Peer';

export class PeerService {
  private static instance: PeerService;
  private currentPeer: Peer | null = null;
  private connections: Map<string, PeerConnection> = new Map();
  private invitations: Map<string, PeerInvitation> = new Map();
  private itemVisibilities: Map<string, ItemVisibility> = new Map();
  private p2pOrders: Map<string, P2POrder> = new Map();

  private constructor() {}

  static getInstance(): PeerService {
    if (!PeerService.instance) {
      PeerService.instance = new PeerService();
    }
    return PeerService.instance;
  }

  // Peer Management
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

    this.currentPeer = peer;
    return peer;
  }

  getCurrentPeer(): Peer | null {
    return this.currentPeer;
  }

  async updatePeerStatus(isOnline: boolean): Promise<void> {
    if (this.currentPeer) {
      this.currentPeer.isOnline = isOnline;
      this.currentPeer.lastSeen = new Date();
      this.currentPeer.updatedAt = new Date();
    }
  }

  // Invitation Management
  async createInvitation(accessLevel: AccessLevel, expiresInHours: number = 24): Promise<PeerInvitation> {
    if (!this.currentPeer) {
      throw new Error('No current peer found');
    }

    const invitationId = this.generateInvitationId();
    const invitationCode = this.generateInvitationCode();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const invitation: PeerInvitation = {
      invitationId,
      fromPeerId: this.currentPeer.peerId,
      invitationCode,
      accessLevel,
      expiresAt,
      isUsed: false,
      createdAt: new Date()
    };

    this.invitations.set(invitationId, invitation);
    return invitation;
  }

  async acceptInvitation(invitationCode: string, peerName: string): Promise<PeerConnection> {
    const invitation = this.findInvitationByCode(invitationCode);
    
    if (!invitation) {
      throw new Error('Invalid invitation code');
    }

    if (invitation.isUsed) {
      throw new Error('Invitation already used');
    }

    if (invitation.expiresAt < new Date()) {
      throw new Error('Invitation expired');
    }

    if (!this.currentPeer) {
      throw new Error('No current peer found');
    }

    // Mark invitation as used
    invitation.isUsed = true;
    invitation.usedByPeerId = this.currentPeer.peerId;

    // Create connection
    const connectionId = this.generateConnectionId();
    const connection: PeerConnection = {
      connectionId,
      peerAId: invitation.fromPeerId,
      peerBId: this.currentPeer.peerId,
      invitationCode,
      status: ConnectionStatus.ACTIVE,
      accessLevel: invitation.accessLevel,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivity: new Date()
    };

    this.connections.set(connectionId, connection);
    return connection;
  }

  // Connection Management
  getConnections(): PeerConnection[] {
    if (!this.currentPeer) return [];
    
    return Array.from(this.connections.values()).filter(
      conn => conn.peerAId === this.currentPeer!.peerId || conn.peerBId === this.currentPeer!.peerId
    );
  }

  getActiveConnections(): PeerConnection[] {
    return this.getConnections().filter(conn => conn.status === ConnectionStatus.ACTIVE);
  }

  async disconnectPeer(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.status = ConnectionStatus.DISCONNECTED;
      connection.updatedAt = new Date();
    }
  }

  // Item Visibility Management
  async setItemVisibility(
    itemId: string, 
    visibilityType: VisibilityType, 
    allowedPeerIds: string[] = [],
    accessLevel: AccessLevel = AccessLevel.VIEW
  ): Promise<ItemVisibility> {
    if (!this.currentPeer) {
      throw new Error('No current peer found');
    }

    const visibilityId = this.generateVisibilityId();
    const visibility: ItemVisibility = {
      visibilityId,
      itemId,
      ownerPeerId: this.currentPeer.peerId,
      visibilityType,
      allowedPeerIds,
      accessLevel,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.itemVisibilities.set(visibilityId, visibility);
    return visibility;
  }

  getVisibleItems(): string[] {
    if (!this.currentPeer) return [];

    const visibleItems: string[] = [];
    
    // Get items from active connections
    const activeConnections = this.getActiveConnections();
    
    for (const visibility of this.itemVisibilities.values()) {
      // Check if current peer can see this item
      if (this.canPeerSeeItem(visibility, this.currentPeer.peerId)) {
        visibleItems.push(visibility.itemId);
      }
    }

    return visibleItems;
  }

  // P2P Order Management
  async createP2POrder(
    toPeerId: string,
    itemId: string,
    quantity: number,
    price: number,
    notes?: string
  ): Promise<P2POrder> {
    if (!this.currentPeer) {
      throw new Error('No current peer found');
    }

    // Check if peer has permission to order from this peer
    const connection = this.findConnectionBetweenPeers(this.currentPeer.peerId, toPeerId);
    if (!connection || connection.status !== ConnectionStatus.ACTIVE) {
      throw new Error('No active connection with this peer');
    }

    const orderId = this.generateOrderId();
    const order: P2POrder = {
      orderId,
      fromPeerId: this.currentPeer.peerId,
      toPeerId,
      itemId,
      quantity,
      price,
      status: P2POrderStatus.PENDING,
      notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.p2pOrders.set(orderId, order);
    return order;
  }

  getP2POrders(): P2POrder[] {
    if (!this.currentPeer) return [];

    return Array.from(this.p2pOrders.values()).filter(
      order => order.fromPeerId === this.currentPeer!.peerId || order.toPeerId === this.currentPeer!.peerId
    );
  }

  // Private Helper Methods
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

  private findInvitationByCode(code: string): PeerInvitation | undefined {
    return Array.from(this.invitations.values()).find(inv => inv.invitationCode === code);
  }

  private findConnectionBetweenPeers(peerAId: string, peerBId: string): PeerConnection | undefined {
    return Array.from(this.connections.values()).find(
      conn => (conn.peerAId === peerAId && conn.peerBId === peerBId) ||
              (conn.peerAId === peerBId && conn.peerBId === peerAId)
    );
  }

  private canPeerSeeItem(visibility: ItemVisibility, peerId: string): boolean {
    if (visibility.ownerPeerId === peerId) return true;
    
    switch (visibility.visibilityType) {
      case VisibilityType.PUBLIC:
        return true;
      case VisibilityType.PRIVATE:
        return visibility.allowedPeerIds.includes(peerId);
      case VisibilityType.CUSTOMER_ONLY:
        // Check if peer has an active connection with the owner
        const connection = this.findConnectionBetweenPeers(visibility.ownerPeerId, peerId);
        return connection?.status === ConnectionStatus.ACTIVE;
      default:
        return false;
    }
  }
}
