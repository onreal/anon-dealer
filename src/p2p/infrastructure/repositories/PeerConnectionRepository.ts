import { DATA_TYPE } from 'jsstore';
import { Repository } from '../../../persistent/repository/Repository';
import { PeerConnection, ConnectionStatus, AccessLevel } from '../../domain/models/Peer';

export class PeerConnectionRepository extends Repository<PeerConnection> {
  constructor() {
    super('peer_connections', {
      connectionId: { dataType: DATA_TYPE.String, primaryKey: true, encrypt: true },
      peerAId: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
      peerBId: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
      invitationCode: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
      status: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
      accessLevel: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
      createdAt: { dataType: DATA_TYPE.DateTime, notNull: true, encrypt: true },
      updatedAt: { dataType: DATA_TYPE.DateTime, notNull: true, encrypt: true },
      lastActivity: { dataType: DATA_TYPE.DateTime, notNull: true, encrypt: true }
    });
  }

  static getRepository() {
    return {
      name: "peer_connections",
      columns: {
        connectionId: { dataType: DATA_TYPE.String, primaryKey: true, encrypt: true },
        peerAId: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
        peerBId: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
        invitationCode: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
        status: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
        accessLevel: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
        createdAt: { dataType: DATA_TYPE.DateTime, notNull: true, encrypt: true },
        updatedAt: { dataType: DATA_TYPE.DateTime, notNull: true, encrypt: true },
        lastActivity: { dataType: DATA_TYPE.DateTime, notNull: true, encrypt: true }
      }
    };
  }

  async getConnectionsByPeerId(peerId: string): Promise<PeerConnection[]> {
    const connections = await this.getAll();
    return connections.filter(
      conn => conn.peerAId === peerId || conn.peerBId === peerId
    );
  }

  async getActiveConnectionsByPeerId(peerId: string): Promise<PeerConnection[]> {
    const connections = await this.getConnectionsByPeerId(peerId);
    return connections.filter(conn => conn.status === ConnectionStatus.ACTIVE);
  }

  async getConnectionBetweenPeers(peerAId: string, peerBId: string): Promise<PeerConnection | null> {
    const connections = await this.getAll();
    return connections.find(
      conn => (conn.peerAId === peerAId && conn.peerBId === peerBId) ||
              (conn.peerAId === peerBId && conn.peerBId === peerAId)
    ) || null;
  }

  async updateConnectionStatus(connectionId: string, status: ConnectionStatus): Promise<void> {
    const connection = await this.getById(connectionId);
    if (connection) {
      connection.status = status;
      connection.updatedAt = new Date();
      connection.lastActivity = new Date();
      await this.update(connection);
    }
  }

  async updateLastActivity(connectionId: string): Promise<void> {
    const connection = await this.getById(connectionId);
    if (connection) {
      connection.lastActivity = new Date();
      connection.updatedAt = new Date();
      await this.update(connection);
    }
  }
}
