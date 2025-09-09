import { DATA_TYPE } from 'jsstore';

export const getP2PDatabase = () => {
    return {
        name: "AnonInstanceP2P",
        tables: [
            // Peer table
            {
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
            },
            // Peer connections table
            {
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
            },
            // Peer invitations table
            {
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
            },
            // Item visibility table
            {
                name: "item_visibility",
                columns: {
                    visibilityId: { dataType: DATA_TYPE.String, primaryKey: true, encrypt: true },
                    itemId: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
                    ownerPeerId: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
                    visibilityType: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
                    allowedPeerIds: { dataType: DATA_TYPE.Array, notNull: true, encrypt: true },
                    accessLevel: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
                    createdAt: { dataType: DATA_TYPE.DateTime, notNull: true, encrypt: true },
                    updatedAt: { dataType: DATA_TYPE.DateTime, notNull: true, encrypt: true }
                }
            },
            // P2P orders table
            {
                name: "p2p_orders",
                columns: {
                    orderId: { dataType: DATA_TYPE.String, primaryKey: true, encrypt: true },
                    fromPeerId: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
                    toPeerId: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
                    itemId: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
                    quantity: { dataType: DATA_TYPE.Number, notNull: true, encrypt: true },
                    price: { dataType: DATA_TYPE.Number, notNull: true, encrypt: true },
                    status: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
                    notes: { dataType: DATA_TYPE.String, encrypt: true },
                    createdAt: { dataType: DATA_TYPE.DateTime, notNull: true, encrypt: true },
                    updatedAt: { dataType: DATA_TYPE.DateTime, notNull: true, encrypt: true },
                    completedAt: { dataType: DATA_TYPE.DateTime, encrypt: true }
                }
            }
        ]
    };
};
