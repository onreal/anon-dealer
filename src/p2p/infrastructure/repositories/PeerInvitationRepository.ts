import { DATA_TYPE } from 'jsstore';
import { Repository } from '../../../persistent/repository/Repository';
import { PeerInvitation, AccessLevel } from '../../domain/models/Peer';

export class PeerInvitationRepository extends Repository<PeerInvitation> {
  constructor() {
    super('peer_invitations', {
      invitationId: { dataType: DATA_TYPE.String, primaryKey: true, encrypt: true },
      fromPeerId: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
      invitationCode: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
      accessLevel: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
      expiresAt: { dataType: DATA_TYPE.DateTime, notNull: true, encrypt: true },
      isUsed: { dataType: DATA_TYPE.Boolean, notNull: true, default: false, encrypt: true },
      usedByPeerId: { dataType: DATA_TYPE.String, encrypt: true },
      createdAt: { dataType: DATA_TYPE.DateTime, notNull: true, encrypt: true }
    });
  }

  static getRepository() {
    return {
      name: "peer_invitations",
      columns: {
        invitationId: { dataType: DATA_TYPE.String, primaryKey: true, encrypt: true },
        fromPeerId: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
        invitationCode: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
        accessLevel: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
        expiresAt: { dataType: DATA_TYPE.DateTime, notNull: true, encrypt: true },
        isUsed: { dataType: DATA_TYPE.Boolean, notNull: true, default: false, encrypt: true },
        usedByPeerId: { dataType: DATA_TYPE.String, encrypt: true },
        createdAt: { dataType: DATA_TYPE.DateTime, notNull: true, encrypt: true }
      }
    };
  }

  async getInvitationByCode(invitationCode: string): Promise<PeerInvitation | null> {
    const invitations = await this.getAll();
    return invitations.find(inv => inv.invitationCode === invitationCode) || null;
  }

  async getInvitationsByPeerId(peerId: string): Promise<PeerInvitation[]> {
    const invitations = await this.getAll();
    return invitations.filter(inv => inv.fromPeerId === peerId);
  }

  async getActiveInvitationsByPeerId(peerId: string): Promise<PeerInvitation[]> {
    const invitations = await this.getInvitationsByPeerId(peerId);
    const now = new Date();
    return invitations.filter(inv => !inv.isUsed && inv.expiresAt > now);
  }

  async markInvitationAsUsed(invitationId: string, usedByPeerId: string): Promise<void> {
    const invitation = await this.getById(invitationId);
    if (invitation) {
      invitation.isUsed = true;
      invitation.usedByPeerId = usedByPeerId;
      await this.update(invitation);
    }
  }

  async getExpiredInvitations(): Promise<PeerInvitation[]> {
    const invitations = await this.getAll();
    const now = new Date();
    return invitations.filter(inv => !inv.isUsed && inv.expiresAt <= now);
  }

  async cleanupExpiredInvitations(): Promise<void> {
    const expiredInvitations = await this.getExpiredInvitations();
    for (const invitation of expiredInvitations) {
      await this.delete(invitation.invitationId);
    }
  }
}
