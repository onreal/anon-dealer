export interface Peer {
  peerId: string;
  name: string;
  publicKey: string;
  privateKey: string;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PeerConnection {
  connectionId: string;
  peerAId: string;
  peerBId: string;
  peerAName?: string;
  peerBName?: string;
  invitationCode: string;
  status: ConnectionStatus;
  accessLevel: AccessLevel;
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;
}

export interface PeerInvitation {
  invitationId: string;
  fromPeerId: string;
  invitationCode: string;
  accessLevel: AccessLevel;
  expiresAt: Date;
  isUsed: boolean;
  usedByPeerId?: string;
  createdAt: Date;
}

export interface ItemVisibility {
  visibilityId: string;
  itemId: string;
  ownerPeerId: string;
  visibilityType: VisibilityType;
  allowedPeerIds: string[];
  accessLevel: AccessLevel;
  createdAt: Date;
  updatedAt: Date;
}

export interface P2POrder {
  orderId: string;
  fromPeerId: string;
  toPeerId: string;
  itemId: string;
  quantity: number;
  price: number;
  status: P2POrderStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export enum ConnectionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  DISCONNECTED = 'disconnected'
}

export enum AccessLevel {
  VIEW = 'view',
  ORDER = 'order',
  MANAGE = 'manage'
}

export enum VisibilityType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  CUSTOMER_ONLY = 'customer_only'
}

export enum P2POrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}
