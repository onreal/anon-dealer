import { DATA_TYPE } from 'jsstore';
import { Repository } from '../../../persistent/repository/Repository';
import { ItemVisibility, VisibilityType, AccessLevel } from '../../domain/models/Peer';

export class ItemVisibilityRepository extends Repository<ItemVisibility> {
  private static instance: ItemVisibilityRepository;

  constructor() {
    super('item_visibility', {
      visibilityId: { dataType: DATA_TYPE.String, primaryKey: true, encrypt: true },
      itemId: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
      ownerPeerId: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
      visibilityType: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
      allowedPeerIds: { dataType: DATA_TYPE.Array, notNull: true, encrypt: true },
      accessLevel: { dataType: DATA_TYPE.String, notNull: true, encrypt: true },
      createdAt: { dataType: DATA_TYPE.DateTime, notNull: true, encrypt: true },
      updatedAt: { dataType: DATA_TYPE.DateTime, notNull: true, encrypt: true }
    });
  }

  static getInstance(): ItemVisibilityRepository {
    if (!ItemVisibilityRepository.instance) {
      ItemVisibilityRepository.instance = new ItemVisibilityRepository();
    }
    return ItemVisibilityRepository.instance;
  }

  static getRepository() {
    return {
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
    };
  }

  async getVisibilityByItemId(itemId: string): Promise<ItemVisibility | null> {
    const visibilities = await this.getAll();
    return visibilities.find(vis => vis.itemId === itemId) || null;
  }

  async getVisibleItemsForPeer(peerId: string): Promise<string[]> {
    const visibilities = await this.getAll();
    const visibleItems: string[] = [];

    for (const visibility of visibilities) {
      if (this.canPeerSeeItem(visibility, peerId)) {
        visibleItems.push(visibility.itemId);
      }
    }

    return visibleItems;
  }

  async getItemsByOwner(ownerPeerId: string): Promise<ItemVisibility[]> {
    const visibilities = await this.getAll();
    return visibilities.filter(vis => vis.ownerPeerId === ownerPeerId);
  }

  async getPublicItems(): Promise<ItemVisibility[]> {
    const visibilities = await this.getAll();
    return visibilities.filter(vis => vis.visibilityType === VisibilityType.PUBLIC);
  }

  async getPrivateItemsForPeer(peerId: string): Promise<ItemVisibility[]> {
    const visibilities = await this.getAll();
    return visibilities.filter(vis => 
      vis.visibilityType === VisibilityType.PRIVATE && 
      vis.allowedPeerIds.includes(peerId)
    );
  }

  async getCustomerOnlyItemsForPeer(peerId: string): Promise<ItemVisibility[]> {
    const visibilities = await this.getAll();
    return visibilities.filter(vis => 
      vis.visibilityType === VisibilityType.CUSTOMER_ONLY && 
      vis.allowedPeerIds.includes(peerId)
    );
  }

  async updateItemVisibility(
    itemId: string, 
    visibilityType: VisibilityType, 
    allowedPeerIds: string[],
    accessLevel: AccessLevel
  ): Promise<void> {
    const visibility = await this.getVisibilityByItemId(itemId);
    if (visibility) {
      visibility.visibilityType = visibilityType;
      visibility.allowedPeerIds = allowedPeerIds;
      visibility.accessLevel = accessLevel;
      visibility.updatedAt = new Date();
      await this.update(visibility);
    }
  }

  async addPeerToItemVisibility(itemId: string, peerId: string): Promise<void> {
    const visibility = await this.getVisibilityByItemId(itemId);
    if (visibility && !visibility.allowedPeerIds.includes(peerId)) {
      visibility.allowedPeerIds.push(peerId);
      visibility.updatedAt = new Date();
      await this.update(visibility);
    }
  }

  async removePeerFromItemVisibility(itemId: string, peerId: string): Promise<void> {
    const visibility = await this.getVisibilityByItemId(itemId);
    if (visibility) {
      visibility.allowedPeerIds = visibility.allowedPeerIds.filter(id => id !== peerId);
      visibility.updatedAt = new Date();
      await this.update(visibility);
    }
  }

  private canPeerSeeItem(visibility: ItemVisibility, peerId: string): boolean {
    if (visibility.ownerPeerId === peerId) return true;
    
    switch (visibility.visibilityType) {
      case VisibilityType.PUBLIC:
        return true;
      case VisibilityType.PRIVATE:
        return visibility.allowedPeerIds.includes(peerId);
      case VisibilityType.CUSTOMER_ONLY:
        return visibility.allowedPeerIds.includes(peerId);
      default:
        return false;
    }
  }
}
