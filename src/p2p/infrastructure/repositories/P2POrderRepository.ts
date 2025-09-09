import { DATA_TYPE } from 'jsstore';
import { Repository } from '../../../persistent/repository/Repository';
import { P2POrder, P2POrderStatus } from '../../domain/models/Peer';

export class P2POrderRepository extends Repository<P2POrder> {
  constructor() {
    super('p2p_orders', {
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
    });
  }

  static getRepository() {
    return {
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
    };
  }

  async getOrdersByPeerId(peerId: string): Promise<P2POrder[]> {
    const orders = await this.getAll();
    return orders.filter(
      order => order.fromPeerId === peerId || order.toPeerId === peerId
    );
  }

  async getOrdersFromPeer(peerId: string): Promise<P2POrder[]> {
    const orders = await this.getAll();
    return orders.filter(order => order.fromPeerId === peerId);
  }

  async getOrdersToPeer(peerId: string): Promise<P2POrder[]> {
    const orders = await this.getAll();
    return orders.filter(order => order.toPeerId === peerId);
  }

  async getOrdersByStatus(status: P2POrderStatus): Promise<P2POrder[]> {
    const orders = await this.getAll();
    return orders.filter(order => order.status === status);
  }

  async getOrdersBetweenPeers(peerAId: string, peerBId: string): Promise<P2POrder[]> {
    const orders = await this.getAll();
    return orders.filter(
      order => (order.fromPeerId === peerAId && order.toPeerId === peerBId) ||
              (order.fromPeerId === peerBId && order.toPeerId === peerAId)
    );
  }

  async updateOrderStatus(orderId: string, status: P2POrderStatus): Promise<void> {
    const order = await this.getById(orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date();
      
      if (status === P2POrderStatus.DELIVERED) {
        order.completedAt = new Date();
      }
      
      await this.update(order);
    }
  }

  async getPendingOrdersForPeer(peerId: string): Promise<P2POrder[]> {
    const orders = await this.getOrdersToPeer(peerId);
    return orders.filter(order => order.status === P2POrderStatus.PENDING);
  }

  async getActiveOrdersForPeer(peerId: string): Promise<P2POrder[]> {
    const orders = await this.getOrdersByPeerId(peerId);
    return orders.filter(order => 
      order.status === P2POrderStatus.CONFIRMED || 
      order.status === P2POrderStatus.SHIPPED
    );
  }

  async getCompletedOrdersForPeer(peerId: string): Promise<P2POrder[]> {
    const orders = await this.getOrdersByPeerId(peerId);
    return orders.filter(order => order.status === P2POrderStatus.DELIVERED);
  }
}
