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

    try {
      // Create invitation through signaling server
      const response = await fetch('http://localhost:8080/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromPeerId: this.currentPeer.peerId,
          accessLevel,
          expiresInHours,
          fromPeerName: this.currentPeer.name
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create invitation');
      }

      const invitation = await response.json();
      
      // Convert server response to local format
      const localInvitation: PeerInvitation = {
        invitationId: invitation.invitationId,
        fromPeerId: invitation.fromPeerId,
        invitationCode: invitation.invitationCode,
        accessLevel: invitation.accessLevel,
        expiresAt: new Date(invitation.expiresAt),
        isUsed: invitation.isUsed,
        createdAt: new Date(invitation.createdAt)
      };

      // Store locally for reference
      this.invitations.set(invitation.invitationId, localInvitation);
      await this.saveToLocalStorage();
      
      return localInvitation;
    } catch (error) {
      console.error('Error creating invitation:', error);
      throw error;
    }
  }

  async acceptInvitation(invitationCode: string, peerName: string): Promise<PeerConnection> {
    if (!this.currentPeer) {
      throw new Error('No current peer found. Please create a peer first.');
    }

    try {
      // Accept invitation through signaling server
      const response = await fetch(`http://localhost:8080/api/invitations/${invitationCode}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          peerId: this.currentPeer.peerId,
          peerName
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to accept invitation');
      }

      const connectionData = await response.json();
      
      // Convert server response to local format
      const connection: PeerConnection = {
        connectionId: connectionData.connectionId,
        peerAId: connectionData.peerAId,
        peerBId: connectionData.peerBId,
        invitationCode: connectionData.invitationCode,
        status: ConnectionStatus.ACTIVE,
        accessLevel: connectionData.accessLevel,
        createdAt: new Date(connectionData.createdAt),
        updatedAt: new Date(connectionData.updatedAt),
        lastActivity: new Date(connectionData.lastActivity)
      };

      // Store locally
      this.connections.set(connection.connectionId, connection);
      await this.saveToLocalStorage();
      
      return connection;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }

  // Connection Management
  async getConnections(): Promise<PeerConnection[]> {
    if (!this.currentPeer) return [];
    
    try {
      // Fetch connections from server
      const response = await fetch(`http://localhost:8080/api/peers/${this.currentPeer.peerId}/connections`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch connections');
      }

      const serverConnections = await response.json();
      
      // Convert server format to local format
      const connections: PeerConnection[] = serverConnections.map((conn: any) => ({
        connectionId: conn.connectionId,
        peerAId: conn.peerAId,
        peerBId: conn.peerBId,
        peerAName: conn.peerAName,
        peerBName: conn.peerBName,
        invitationCode: conn.invitationCode,
        status: ConnectionStatus.ACTIVE, // Server only stores active connections
        accessLevel: conn.accessLevel,
        createdAt: new Date(conn.createdAt),
        updatedAt: new Date(conn.updatedAt),
        lastActivity: new Date(conn.lastActivity)
      }));

      // Update local storage
      this.connections.clear();
      connections.forEach(conn => {
        this.connections.set(conn.connectionId, conn);
      });
      await this.saveToLocalStorage();

      return connections;
    } catch (error) {
      console.error('Error fetching connections from server:', error);
      // Fallback to local storage
      return Array.from(this.connections.values()).filter(
        conn => conn.peerAId === this.currentPeer!.peerId || conn.peerBId === this.currentPeer!.peerId
      );
    }
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

  // Inventory Synchronization
  async syncInventoryWithPeers(): Promise<void> {
    if (!this.currentPeer) return;

    try {
      // Get all active connections
      const connections = await this.getActiveConnections();
      
      for (const connection of connections) {
        const otherPeerId = connection.peerAId === this.currentPeer.peerId 
          ? connection.peerBId 
          : connection.peerAId;
        
        // Fetch inventory from the other peer
        await this.fetchPeerInventory(otherPeerId);
      }
    } catch (error) {
      console.error('Error syncing inventory with peers:', error);
    }
  }

  async fetchPeerInventory(peerId: string): Promise<any[]> {
    try {
      const response = await fetch(`http://localhost:8080/api/peers/${peerId}/inventory`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch peer inventory');
      }

      const inventory = await response.json();
      console.log(`Fetched inventory from peer ${peerId}:`, inventory);
      return inventory;
    } catch (error) {
      console.error(`Error fetching inventory from peer ${peerId}:`, error);
      return [];
    }
  }

  async shareInventoryWithPeers(items: any[]): Promise<void> {
    if (!this.currentPeer) return;

    try {
      const response = await fetch(`http://localhost:8080/api/peers/${this.currentPeer.peerId}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items })
      });

      if (!response.ok) {
        throw new Error('Failed to share inventory');
      }

      console.log(`Shared inventory with peers:`, { count: items.length });
    } catch (error) {
      console.error('Error sharing inventory:', error);
      throw error;
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
