<template>
  <div class="p2p-orders">
    <!-- Header -->
    <div class="orders-header">
      <h1>P2P Orders</h1>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateOrderDialog = true">
          <el-icon><Plus /></el-icon>
          Create Order
        </el-button>
      </div>
    </div>

    <!-- Filter and Search -->
    <div class="filter-section">
      <div class="filter-controls">
        <el-input
          v-model="searchQuery"
          placeholder="Search orders..."
          class="search-input"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select v-model="statusFilter" placeholder="Filter by status" clearable>
          <el-option label="All Orders" value="" />
          <el-option label="Pending" value="pending" />
          <el-option label="Confirmed" value="confirmed" />
          <el-option label="Shipped" value="shipped" />
          <el-option label="Delivered" value="delivered" />
          <el-option label="Cancelled" value="cancelled" />
        </el-select>
        
        <el-select v-model="directionFilter" placeholder="Filter by direction" clearable>
          <el-option label="All Orders" value="" />
          <el-option label="Orders I Sent" value="sent" />
          <el-option label="Orders I Received" value="received" />
        </el-select>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="orders-table" v-if="filteredOrders.length > 0">
      <el-table :data="filteredOrders" style="width: 100%">
        <el-table-column prop="orderId" label="Order ID" width="120">
          <template #default="scope">
            <el-text type="primary" style="font-family: monospace;">
              {{ scope.row.orderId.substring(0, 12) }}...
            </el-text>
          </template>
        </el-table-column>
        
        <el-table-column prop="itemId" label="Item" width="100">
          <template #default="scope">
            {{ scope.row.itemId }}
          </template>
        </el-table-column>
        
        <el-table-column prop="quantity" label="Qty" width="80" />
        
        <el-table-column prop="price" label="Price" width="100">
          <template #default="scope">
            ${{ scope.row.price.toFixed(2) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="Status" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="direction" label="Direction" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.direction === 'sent' ? 'primary' : 'success'">
              {{ scope.row.direction === 'sent' ? 'Sent' : 'Received' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="Created" width="150">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="Actions" width="200">
          <template #default="scope">
            <div class="action-buttons">
              <el-button 
                v-if="canUpdateStatus(scope.row)"
                type="primary" 
                size="small" 
                @click="updateOrderStatus(scope.row)"
              >
                Update Status
              </el-button>
              
              <el-button 
                v-if="canCancelOrder(scope.row)"
                type="danger" 
                size="small" 
                @click="cancelOrder(scope.row.orderId)"
              >
                Cancel
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Empty State -->
    <div class="empty-state" v-else>
      <el-icon class="empty-icon"><List /></el-icon>
      <h3>No P2P Orders</h3>
      <p>Create an order or wait for other peers to send you orders.</p>
    </div>

    <!-- Create Order Dialog -->
    <el-dialog 
      v-model="showCreateOrderDialog" 
      title="Create P2P Order" 
      width="500px"
    >
      <el-form :model="orderForm" :rules="orderRules" ref="orderFormRef">
        <el-form-item label="To Peer" prop="toPeerId">
          <el-select 
            v-model="orderForm.toPeerId" 
            placeholder="Select peer"
            filterable
          >
            <el-option
              v-for="peer in availablePeers"
              :key="peer.peerId"
              :label="peer.name"
              :value="peer.peerId"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="Item" prop="itemId">
          <el-select 
            v-model="orderForm.itemId" 
            placeholder="Select item"
            filterable
          >
            <el-option
              v-for="item in availableItems"
              :key="item.itemId"
              :label="item.name || `Item ${item.itemId}`"
              :value="item.itemId"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="Quantity" prop="quantity">
          <el-input-number 
            v-model="orderForm.quantity" 
            :min="1" 
            :max="1000"
            placeholder="Enter quantity"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="Price" prop="price">
          <el-input-number 
            v-model="orderForm.price" 
            :min="0" 
            :precision="2"
            placeholder="Enter price"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="Notes" prop="notes">
          <el-input 
            v-model="orderForm.notes" 
            type="textarea" 
            :rows="3"
            placeholder="Optional notes"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showCreateOrderDialog = false">Cancel</el-button>
        <el-button type="primary" @click="createOrder">Create Order</el-button>
      </template>
    </el-dialog>

    <!-- Update Status Dialog -->
    <el-dialog 
      v-model="showUpdateStatusDialog" 
      title="Update Order Status" 
      width="400px"
    >
      <el-form :model="statusForm" :rules="statusRules" ref="statusFormRef">
        <el-form-item label="New Status" prop="status">
          <el-select v-model="statusForm.status" placeholder="Select status">
            <el-option 
              v-for="status in getAvailableStatuses(selectedOrder)"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showUpdateStatusDialog = false">Cancel</el-button>
        <el-button type="primary" @click="saveStatusUpdate">Update Status</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search, List } from '@element-plus/icons-vue';
import { PeerCommand } from '../../application/commands/PeerCommand';
import { P2POrder, P2POrderStatus } from '../../domain/models/Peer';

// Reactive data
const peerCommand = new PeerCommand();
const orders = ref<P2POrder[]>([]);
const availablePeers = ref<any[]>([]);
const availableItems = ref<any[]>([]);
const searchQuery = ref('');
const statusFilter = ref('');
const directionFilter = ref('');

// Dialog states
const showCreateOrderDialog = ref(false);
const showUpdateStatusDialog = ref(false);

// Form data
const orderForm = reactive({
  toPeerId: '',
  itemId: '',
  quantity: 1,
  price: 0,
  notes: ''
});

const statusForm = reactive({
  status: '' as P2POrderStatus
});

const selectedOrder = ref<P2POrder | null>(null);

// Form refs
const orderFormRef = ref();
const statusFormRef = ref();

// Form rules
const orderRules = {
  toPeerId: [
    { required: true, message: 'Please select a peer', trigger: 'change' }
  ],
  itemId: [
    { required: true, message: 'Please select an item', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: 'Please enter quantity', trigger: 'blur' },
    { type: 'number', min: 1, message: 'Quantity must be at least 1', trigger: 'blur' }
  ],
  price: [
    { required: true, message: 'Please enter price', trigger: 'blur' },
    { type: 'number', min: 0, message: 'Price must be non-negative', trigger: 'blur' }
  ]
};

const statusRules = {
  status: [
    { required: true, message: 'Please select a status', trigger: 'change' }
  ]
};

// Computed properties
const filteredOrders = computed(() => {
  let filtered = orders.value.map(order => ({
    ...order,
    direction: order.fromPeerId === 'current_peer' ? 'sent' : 'received'
  }));

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(order => 
      order.orderId.toLowerCase().includes(query) ||
      order.itemId.toLowerCase().includes(query) ||
      (order.notes && order.notes.toLowerCase().includes(query))
    );
  }

  // Apply status filter
  if (statusFilter.value) {
    filtered = filtered.filter(order => order.status === statusFilter.value);
  }

  // Apply direction filter
  if (directionFilter.value) {
    filtered = filtered.filter(order => order.direction === directionFilter.value);
  }

  return filtered;
});

// Methods
const loadData = async () => {
  try {
    orders.value = await peerCommand.getP2POrders();
    
    // Load available peers (mock data)
    availablePeers.value = [
      { peerId: 'peer_2', name: 'Peer 2' },
      { peerId: 'peer_3', name: 'Peer 3' },
      { peerId: 'peer_4', name: 'Peer 4' }
    ];

    // Load available items (mock data)
    availableItems.value = [
      { itemId: 'item_1', name: 'Sample Item 1' },
      { itemId: 'item_2', name: 'Sample Item 2' },
      { itemId: 'item_3', name: 'Sample Item 3' }
    ];
  } catch (error) {
    console.error('Error loading P2P orders:', error);
    ElMessage.error('Failed to load P2P orders');
  }
};

const createOrder = async () => {
  try {
    await orderFormRef.value.validate();
    
    const order = await peerCommand.createP2POrder(
      orderForm.toPeerId,
      orderForm.itemId,
      orderForm.quantity,
      orderForm.price,
      orderForm.notes || undefined
    );
    
    orders.value.push(order);
    showCreateOrderDialog.value = false;
    ElMessage.success('Order created successfully');
    
    // Reset form
    orderForm.toPeerId = '';
    orderForm.itemId = '';
    orderForm.quantity = 1;
    orderForm.price = 0;
    orderForm.notes = '';
  } catch (error) {
    console.error('Error creating order:', error);
    ElMessage.error(error instanceof Error ? error.message : 'Failed to create order');
  }
};

const updateOrderStatus = (order: P2POrder) => {
  selectedOrder.value = order;
  statusForm.status = order.status;
  showUpdateStatusDialog.value = true;
};

const saveStatusUpdate = async () => {
  try {
    await statusFormRef.value.validate();
    
    if (selectedOrder.value) {
      await peerCommand.updateOrderStatus(selectedOrder.value.orderId, statusForm.status);
      
      // Update local order
      const orderIndex = orders.value.findIndex(o => o.orderId === selectedOrder.value!.orderId);
      if (orderIndex >= 0) {
        orders.value[orderIndex].status = statusForm.status;
        orders.value[orderIndex].updatedAt = new Date();
      }
      
      showUpdateStatusDialog.value = false;
      ElMessage.success('Order status updated successfully');
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    ElMessage.error('Failed to update order status');
  }
};

const cancelOrder = async (orderId: string) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to cancel this order?',
      'Cancel Order',
      {
        confirmButtonText: 'Cancel Order',
        cancelButtonText: 'Keep Order',
        type: 'warning'
      }
    );
    
    await peerCommand.updateOrderStatus(orderId, P2POrderStatus.CANCELLED);
    
    // Update local order
    const orderIndex = orders.value.findIndex(o => o.orderId === orderId);
    if (orderIndex >= 0) {
      orders.value[orderIndex].status = P2POrderStatus.CANCELLED;
      orders.value[orderIndex].updatedAt = new Date();
    }
    
    ElMessage.success('Order cancelled');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error cancelling order:', error);
      ElMessage.error('Failed to cancel order');
    }
  }
};

const canUpdateStatus = (order: P2POrder): boolean => {
  // Can update status if it's not delivered or cancelled
  return order.status !== P2POrderStatus.DELIVERED && order.status !== P2POrderStatus.CANCELLED;
};

const canCancelOrder = (order: P2POrder): boolean => {
  // Can cancel if it's pending or confirmed
  return order.status === P2POrderStatus.PENDING || order.status === P2POrderStatus.CONFIRMED;
};

const getStatusType = (status: P2POrderStatus) => {
  switch (status) {
    case P2POrderStatus.PENDING: return 'warning';
    case P2POrderStatus.CONFIRMED: return 'info';
    case P2POrderStatus.SHIPPED: return 'primary';
    case P2POrderStatus.DELIVERED: return 'success';
    case P2POrderStatus.CANCELLED: return 'danger';
    default: return 'info';
  }
};

const getAvailableStatuses = (order: P2POrder | null) => {
  if (!order) return [];
  
  const statusMap = {
    [P2POrderStatus.PENDING]: [
      { value: P2POrderStatus.CONFIRMED, label: 'Confirm' },
      { value: P2POrderStatus.CANCELLED, label: 'Cancel' }
    ],
    [P2POrderStatus.CONFIRMED]: [
      { value: P2POrderStatus.SHIPPED, label: 'Mark as Shipped' },
      { value: P2POrderStatus.CANCELLED, label: 'Cancel' }
    ],
    [P2POrderStatus.SHIPPED]: [
      { value: P2POrderStatus.DELIVERED, label: 'Mark as Delivered' }
    ]
  };
  
  return statusMap[order.status] || [];
};

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString();
};

// Lifecycle
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.p2p-orders {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--el-border-color);
}

.orders-header h1 {
  margin: 0;
  color: var(--el-text-color-primary);
}

.filter-section {
  margin-bottom: 30px;
}

.filter-controls {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  min-width: 300px;
}

.orders-table {
  background: var(--el-bg-color);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--el-border-color);
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--el-text-color-regular);
}

.empty-icon {
  font-size: 64px;
  color: var(--el-color-info);
  margin-bottom: 20px;
}

.empty-state h3 {
  margin: 0 0 10px 0;
  color: var(--el-text-color-primary);
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

@media (max-width: 768px) {
  .p2p-orders {
    padding: 15px;
  }
  
  .orders-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    min-width: auto;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
