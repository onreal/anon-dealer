import { DATA_TYPE } from 'jsstore';
import { Peer } from '../../domain/models/Peer';
import { P2PDatabase } from '../database/P2PDatabase';

export class PeerRepository {
  private static instance: PeerRepository;
  private p2pDatabase: P2PDatabase;

  constructor() {
    this.p2pDatabase = P2PDatabase.getInstance();
  }

  static getInstance(): PeerRepository {
    if (!PeerRepository.instance) {
      PeerRepository.instance = new PeerRepository();
    }
    return PeerRepository.instance;
  }

  private async getConnection() {
    await this.p2pDatabase.initialize();
    return this.p2pDatabase.getConnection();
  }

  static getRepository() {
    return {
      name: "peers",
      columns: {
        peerId: { dataType: DATA_TYPE.String, primaryKey: true, encrypt: true },
        name: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
        publicKey: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
        privateKey: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
        isOnline: { dataType: DATA_TYPE.Boolean, notNull: true, default: false, encrypt: true },
        lastSeen: { dataType: DATA_TYPE.DateTime, notNull: true, encrypt: true },
        createdAt: { dataType: DATA_TYPE.DateTime, notNull: true, encrypt: true },
        updatedAt: { dataType: DATA_TYPE.DateTime, notNull: true, encrypt: true }
      }
    };
  }

  async add(peer: Peer): Promise<void> {
    const connection = await this.getConnection();
    await connection.insert({
      into: 'peers',
      values: [peer]
    });
  }

  async getAll(): Promise<Peer[]> {
    const connection = await this.getConnection();
    return await connection.select({
      from: 'peers'
    });
  }

  async getById(peerId: string): Promise<Peer | null> {
    const connection = await this.getConnection();
    const results = await connection.select({
      from: 'peers',
      where: { peerId }
    });
    return results.length > 0 ? results[0] : null;
  }

  async update(peer: Peer): Promise<void> {
    const connection = await this.getConnection();
    await connection.update({
      in: 'peers',
      set: peer,
      where: { peerId: peer.peerId }
    });
  }

  async delete(peerId: string): Promise<void> {
    const connection = await this.getConnection();
    await connection.remove({
      from: 'peers',
      where: { peerId }
    });
  }

  async getCurrentPeer(): Promise<Peer | null> {
    const peers = await this.getAll();
    return peers.find(peer => peer.isOnline) || null;
  }

  async setCurrentPeer(peer: Peer): Promise<void> {
    // Set all peers to offline first
    const allPeers = await this.getAll();
    for (const existingPeer of allPeers) {
      if (existingPeer.isOnline) {
        existingPeer.isOnline = false;
        existingPeer.updatedAt = new Date();
        await this.update(existingPeer);
      }
    }

    // Set the new peer as online
    peer.isOnline = true;
    peer.updatedAt = new Date();
    await this.add(peer);
  }

  async updatePeerStatus(peerId: string, isOnline: boolean): Promise<void> {
    const peer = await this.getById(peerId);
    if (peer) {
      peer.isOnline = isOnline;
      peer.lastSeen = new Date();
      peer.updatedAt = new Date();
      await this.update(peer);
    }
  }
}
