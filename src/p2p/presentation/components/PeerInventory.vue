<template>
  <div class="peer-inventory">
    <div class="inventory-header">
      <h3>Peer Inventory</h3>
      <el-button 
        type="primary" 
        @click="refreshInventory"
        :loading="loading"
        size="small"
      >
        <el-icon><Refresh /></el-icon>
        Refresh
      </el-button>
    </div>

    <div class="inventory-content">
      <div v-if="loading" class="loading-state">
        <el-icon class="is-loading"><Loading /></el-icon>
        Loading peer inventory...
      </div>

      <div v-else-if="peerInventory.length === 0" class="empty-state">
        <el-icon><Box /></el-icon>
        <p>No inventory items found from connected peers</p>
      </div>

      <div v-else class="inventory-grid">
        <div 
          v-for="peer in peerInventory" 
          :key="peer.peerId"
          class="peer-section"
        >
          <div class="peer-header">
            <h4>{{ peer.peerName || `Peer ${peer.peerId}` }}</h4>
            <el-tag :type="getConnectionStatusType(peer.connection)">
              {{ getConnectionStatusText(peer.connection) }}
            </el-tag>
          </div>

          <div class="items-grid">
            <div 
              v-for="item in peer.items" 
              :key="item.itemId"
              class="item-card"
            >
              <div class="item-header">
                <h5>{{ item.name || item.itemId }}</h5>
                <el-tag size="small" :type="getAccessLevelType(item.accessLevel)">
                  {{ item.accessLevel }}
                </el-tag>
              </div>
              
              <div class="item-details">
                <p v-if="item.description">{{ item.description }}</p>
                <p v-if="item.price">
                  <strong>Price:</strong> ${{ item.price }}
                </p>
                <p v-if="item.quantity">
                  <strong>Quantity:</strong> {{ item.quantity }}
                </p>
                <p v-if="item.category">
                  <strong>Category:</strong> {{ item.category }}
                </p>
              </div>

              <div class="item-actions">
                <el-button 
                  v-if="item.accessLevel === 'order'"
                  type="primary" 
                  size="small"
                  @click="createOrder(item, peer.peerId)"
                >
                  Order
                </el-button>
                <el-button 
                  type="default" 
                  size="small"
                  @click="viewDetails(item)"
                >
                  View Details
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh, Loading, Box } from '@element-plus/icons-vue';
import { SimpleP2PService } from '../../application/services/SimpleP2PService';
import { PeerConnection, ConnectionStatus, AccessLevel } from '../../domain/models/Peer';

interface PeerInventoryItem {
  itemId: string;
  name: string;
  description?: string;
  price?: number;
  quantity?: number;
  category?: string;
  accessLevel: AccessLevel;
}

interface PeerInventoryData {
  peerId: string;
  peerName: string;
  connection: PeerConnection;
  items: PeerInventoryItem[];
}

const p2pService = SimpleP2PService.getInstance();
const peerInventory = ref<PeerInventoryData[]>([]);
const loading = ref(false);

const loadPeerInventory = async () => {
  loading.value = true;
  try {
    // Get all active connections
    const connections = await p2pService.getActiveConnections();
    
    const inventoryData: PeerInventoryData[] = [];
    
    for (const connection of connections) {
      const otherPeerId = connection.peerAId === p2pService.getCurrentPeer()?.peerId 
        ? connection.peerBId 
        : connection.peerAId;
      
      // Fetch inventory from the other peer
      const items = await p2pService.fetchPeerInventory(otherPeerId);
      
      if (items.length > 0) {
        inventoryData.push({
          peerId: otherPeerId,
          peerName: connection.peerAId === p2pService.getCurrentPeer()?.peerId 
            ? connection.peerBName || `Peer ${otherPeerId}`
            : connection.peerAName || `Peer ${otherPeerId}`,
          connection,
          items
        });
      }
    }
    
    peerInventory.value = inventoryData;
  } catch (error) {
    console.error('Error loading peer inventory:', error);
    ElMessage.error('Failed to load peer inventory');
  } finally {
    loading.value = false;
  }
};

const refreshInventory = () => {
  loadPeerInventory();
};

const getConnectionStatusType = (connection: PeerConnection) => {
  switch (connection.status) {
    case ConnectionStatus.ACTIVE:
      return 'success';
    case ConnectionStatus.PENDING:
      return 'warning';
    case ConnectionStatus.DISCONNECTED:
      return 'danger';
    default:
      return 'info';
  }
};

const getConnectionStatusText = (connection: PeerConnection) => {
  switch (connection.status) {
    case ConnectionStatus.ACTIVE:
      return 'Connected';
    case ConnectionStatus.PENDING:
      return 'Pending';
    case ConnectionStatus.DISCONNECTED:
      return 'Disconnected';
    default:
      return 'Unknown';
  }
};

const getAccessLevelType = (accessLevel: AccessLevel) => {
  switch (accessLevel) {
    case AccessLevel.VIEW:
      return 'info';
    case AccessLevel.ORDER:
      return 'success';
    default:
      return 'default';
  }
};

const createOrder = (item: PeerInventoryItem, peerId: string) => {
  // TODO: Implement order creation
  ElMessage.info(`Order creation for ${item.name} from peer ${peerId} - Coming soon!`);
};

const viewDetails = (item: PeerInventoryItem) => {
  // TODO: Implement item details view
  ElMessage.info(`Viewing details for ${item.name} - Coming soon!`);
};

onMounted(() => {
  loadPeerInventory();
});
</script>

<style lang="scss" scoped>
@import 'src/assets/scss/components/p2p/_peer-inventory.scss';
</style>
