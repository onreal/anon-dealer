import { Peer, PeerConnection, PeerInvitation, ItemVisibility, P2POrder, AccessLevel, VisibilityType, P2POrderStatus, ConnectionStatus } from '../../domain/models/Peer';

export class SimpleP2PService {
  private static instance: SimpleP2PService;
  private currentPeer: Peer | null = null;
  private connections: Map<string, PeerConnection> = new Map();
  private invitations: Map<string, PeerInvitation> = new Map();
  private itemVisibilities: Map<string, ItemVisibility> = new Map();
  private p2pOrders: Map<string, P2POrder> = new Map();
  private isInitialized: boolean = false;

  private constructor() {}

  static getInstance(): SimpleP2PService {
    if (!SimpleP2PService.instance) {
      SimpleP2PService.instance = new SimpleP2PService();
    }
    return SimpleP2PService.instance;
  }

  // Initialization
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Load existing data from localStorage
      await this.loadFromLocalStorage();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Simple P2P Service:', error);
      throw error;
    }
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
    await this.saveToLocalStorage();
    return peer;
  }

  async getCurrentPeer(): Promise<Peer | null> {
    return this.currentPeer;
  }

  async updatePeerStatus(isOnline: boolean): Promise<void> {
    if (this.currentPeer) {
      this.currentPeer.isOnline = isOnline;
      this.currentPeer.lastSeen = new Date();
      this.currentPeer.updatedAt = new Date();
      await this.saveToLocalStorage();
    }
  }

  // Invitation Management
  async createInvitation(accessLevel: AccessLevel, expiresInHours: number = 24): Promise<PeerInvitation> {
    if (!this.currentPeer) {
      throw new Error('No current peer found. Please create a peer first.');
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
    await this.saveToLocalStorage();
    return invitation;
  }

  async acceptInvitation(invitationCode: string, peerName: string): Promise<PeerConnection> {
    const invitation = this.findInvitationByCode(invitationCode);
    
    if (!invitation) {
      throw new Error('Invalid invitation code');
    }

    if (invitation.isUsed) {
      throw new Error('Invitation has already been used');
    }

    if (invitation.expiresAt < new Date()) {
      throw new Error('Invitation has expired');
    }

    if (!this.currentPeer) {
      throw new Error('No current peer found. Please create a peer first.');
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
    await this.saveToLocalStorage();
    return connection;
  }

  // Connection Management
  async getConnections(): Promise<PeerConnection[]> {
    if (!this.currentPeer) return [];
    
    return Array.from(this.connections.values()).filter(
      conn => conn.peerAId === this.currentPeer!.peerId || conn.peerBId === this.currentPeer!.peerId
    );
  }

  async getActiveConnections(): Promise<PeerConnection[]> {
    return this.getConnections().then(connections => 
      connections.filter(conn => conn.status === ConnectionStatus.ACTIVE)
    );
  }

  async disconnectPeer(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.status = ConnectionStatus.DISCONNECTED;
      connection.updatedAt = new Date();
      await this.saveToLocalStorage();
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
    await this.saveToLocalStorage();
    return visibility;
  }

  async getVisibleItems(): Promise<string[]> {
    if (!this.currentPeer) return [];

    const visibleItems: string[] = [];
    
    for (const visibility of this.itemVisibilities.values()) {
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
    await this.saveToLocalStorage();
    return order;
  }

  async getP2POrders(): Promise<P2POrder[]> {
    if (!this.currentPeer) return [];

    return Array.from(this.p2pOrders.values()).filter(
      order => order.fromPeerId === this.currentPeer!.peerId || order.toPeerId === this.currentPeer!.peerId
    );
  }

  async updateOrderStatus(orderId: string, status: P2POrderStatus): Promise<void> {
    const order = this.p2pOrders.get(orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date();
      
      if (status === P2POrderStatus.DELIVERED) {
        order.completedAt = new Date();
      }
      
      await this.saveToLocalStorage();
    }
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
        const connection = this.findConnectionBetweenPeers(visibility.ownerPeerId, peerId);
        return connection?.status === ConnectionStatus.ACTIVE;
      default:
        return false;
    }
  }

  // Local Storage Management
  private async saveToLocalStorage(): Promise<void> {
    try {
      const data = {
        currentPeer: this.currentPeer,
        connections: Array.from(this.connections.entries()),
        invitations: Array.from(this.invitations.entries()),
        itemVisibilities: Array.from(this.itemVisibilities.entries()),
        p2pOrders: Array.from(this.p2pOrders.entries())
      };
      localStorage.setItem('anon_dealer_p2p', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save P2P data to localStorage:', error);
    }
  }

  private async loadFromLocalStorage(): Promise<void> {
    try {
      const data = localStorage.getItem('anon_dealer_p2p');
      if (data) {
        const parsed = JSON.parse(data);
        this.currentPeer = parsed.currentPeer;
        this.connections = new Map(parsed.connections || []);
        this.invitations = new Map(parsed.invitations || []);
        this.itemVisibilities = new Map(parsed.itemVisibilities || []);
        this.p2pOrders = new Map(parsed.p2pOrders || []);
      }
    } catch (error) {
      console.error('Failed to load P2P data from localStorage:', error);
    }
  }
}
