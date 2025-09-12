<template>
  <div class="p2p-items">
    <!-- Header -->
    <div class="items-header">
      <h1>P2P Items</h1>
      <div class="header-actions">
        <el-button type="primary" @click="showVisibilityDialog = true">
          <el-icon><Setting /></el-icon>
          Manage Visibility
        </el-button>
      </div>
    </div>

    <!-- Filter and Search -->
    <div class="filter-section">
      <div class="filter-controls">
        <el-input
          v-model="searchQuery"
          placeholder="Search items..."
          class="search-input"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select v-model="visibilityFilter" placeholder="Filter by visibility" clearable>
          <el-option label="All Items" value="" />
          <el-option label="Public" value="public" />
          <el-option label="Private" value="private" />
          <el-option label="Customer Only" value="customer_only" />
        </el-select>
      </div>
    </div>

    <!-- Items Grid -->
    <div class="items-grid" v-if="filteredItems.length > 0">
      <div 
        v-for="item in filteredItems" 
        :key="item.itemId"
        class="item-card"
      >
        <div class="item-header">
          <h3>{{ item.name || `Item ${item.itemId}` }}</h3>
          <el-tag :type="getVisibilityType(item.visibilityType)">
            {{ getVisibilityLabel(item.visibilityType) }}
          </el-tag>
        </div>
        
        <div class="item-details">
          <p><strong>ID:</strong> {{ item.itemId }}</p>
          <p><strong>Access Level:</strong> {{ item.accessLevel }}</p>
          <p><strong>Shared With:</strong> {{ item.allowedPeerIds.length }} peers</p>
          <p><strong>Updated:</strong> {{ formatDate(item.updatedAt) }}</p>
        </div>
        
        <div class="item-actions">
          <el-button 
            type="primary" 
            size="small" 
            @click="editItemVisibility(item)"
          >
            <el-icon><Edit /></el-icon>
            Edit
          </el-button>
          
          <el-button 
            type="danger" 
            size="small" 
            @click="removeItemVisibility(item.itemId)"
          >
            <el-icon><Delete /></el-icon>
            Remove
          </el-button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div class="empty-state" v-else>
      <el-icon class="empty-icon"><Box /></el-icon>
      <h3>No P2P Items</h3>
      <p>Items will appear here once you set their visibility for P2P sharing.</p>
    </div>

    <!-- Visibility Management Dialog -->
    <el-dialog 
      v-model="showVisibilityDialog" 
      title="Manage Item Visibility" 
      width="600px"
    >
      <div class="visibility-content">
        <el-form :model="visibilityForm" :rules="visibilityRules" ref="visibilityFormRef">
          <el-form-item label="Item" prop="itemId">
            <el-select 
              v-model="visibilityForm.itemId" 
              placeholder="Select item"
              filterable
              @change="onItemSelect"
            >
              <el-option
                v-for="item in availableItems"
                :key="item.itemId"
                :label="item.name || `Item ${item.itemId}`"
                :value="item.itemId"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="Visibility Type" prop="visibilityType">
            <el-radio-group v-model="visibilityForm.visibilityType">
              <el-radio value="public">Public (Visible to all peers)</el-radio>
              <el-radio value="private">Private (Visible to selected peers)</el-radio>
              <el-radio value="customer_only">Customer Only (Visible to connected peers)</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item 
            label="Access Level" 
            prop="accessLevel"
            v-if="visibilityForm.visibilityType !== 'public'"
          >
            <el-select v-model="visibilityForm.accessLevel" placeholder="Select access level">
              <el-option label="View Only" value="view" />
              <el-option label="Can Order" value="order" />
              <el-option label="Full Management" value="manage" />
            </el-select>
          </el-form-item>
          
          <el-form-item 
            label="Allowed Peers" 
            prop="allowedPeerIds"
            v-if="visibilityForm.visibilityType === 'private'"
          >
            <el-select 
              v-model="visibilityForm.allowedPeerIds" 
              multiple
              placeholder="Select peers"
              style="width: 100%"
            >
              <el-option
                v-for="peer in availablePeers"
                :key="peer.peerId"
                :label="peer.name"
                :value="peer.peerId"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <el-button @click="showVisibilityDialog = false">Cancel</el-button>
        <el-button type="primary" @click="saveVisibility">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Setting, Search, Edit, Delete, Box } from '@element-plus/icons-vue';
import { PeerCommand } from '../../application/commands/PeerCommand';
import { ItemVisibility, VisibilityType, AccessLevel } from '../../domain/models/Peer';

// Reactive data
const peerCommand = new PeerCommand();
const items = ref<ItemVisibility[]>([]);
const availableItems = ref<any[]>([]);
const availablePeers = ref<any[]>([]);
const searchQuery = ref('');
const visibilityFilter = ref('');

// Dialog states
const showVisibilityDialog = ref(false);

// Form data
const visibilityForm = reactive({
  itemId: '',
  visibilityType: 'public' as VisibilityType,
  accessLevel: 'view' as AccessLevel,
  allowedPeerIds: [] as string[]
});

// Form refs
const visibilityFormRef = ref();

// Form rules
const visibilityRules = {
  itemId: [
    { required: true, message: 'Please select an item', trigger: 'change' }
  ],
  visibilityType: [
    { required: true, message: 'Please select visibility type', trigger: 'change' }
  ],
  accessLevel: [
    { required: true, message: 'Please select access level', trigger: 'change' }
  ]
};

// Computed properties
const filteredItems = computed(() => {
  let filtered = items.value;

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(item => 
      item.itemId.toLowerCase().includes(query) ||
      (item.allowedPeerIds.length.toString()).includes(query)
    );
  }

  // Apply visibility filter
  if (visibilityFilter.value) {
    filtered = filtered.filter(item => item.visibilityType === visibilityFilter.value);
  }

  return filtered;
});

// Methods
const loadData = async () => {
  try {
    // In a real implementation, you'd load items from the inventory system
    // For now, we'll create some mock data
    items.value = [
      {
        visibilityId: 'vis_1',
        itemId: 'item_1',
        ownerPeerId: 'peer_1',
        visibilityType: VisibilityType.PUBLIC,
        allowedPeerIds: [],
        accessLevel: AccessLevel.VIEW,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        visibilityId: 'vis_2',
        itemId: 'item_2',
        ownerPeerId: 'peer_1',
        visibilityType: VisibilityType.PRIVATE,
        allowedPeerIds: ['peer_2', 'peer_3'],
        accessLevel: AccessLevel.ORDER,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Load available items (mock data)
    availableItems.value = [
      { itemId: 'item_1', name: 'Sample Item 1' },
      { itemId: 'item_2', name: 'Sample Item 2' },
      { itemId: 'item_3', name: 'Sample Item 3' }
    ];

    // Load available peers (mock data)
    availablePeers.value = [
      { peerId: 'peer_2', name: 'Peer 2' },
      { peerId: 'peer_3', name: 'Peer 3' },
      { peerId: 'peer_4', name: 'Peer 4' }
    ];
  } catch (error) {
    console.error('Error loading P2P items:', error);
    ElMessage.error('Failed to load P2P items');
  }
};

const onItemSelect = (itemId: string) => {
  // Check if item already has visibility settings
  const existingItem = items.value.find(item => item.itemId === itemId);
  if (existingItem) {
    visibilityForm.visibilityType = existingItem.visibilityType;
    visibilityForm.accessLevel = existingItem.accessLevel;
    visibilityForm.allowedPeerIds = [...existingItem.allowedPeerIds];
  } else {
    // Reset form for new item
    visibilityForm.visibilityType = 'public';
    visibilityForm.accessLevel = 'view';
    visibilityForm.allowedPeerIds = [];
  }
};

const saveVisibility = async () => {
  try {
    await visibilityFormRef.value.validate();
    
    const visibility = await peerCommand.setItemVisibility(
      visibilityForm.itemId,
      visibilityForm.visibilityType,
      visibilityForm.allowedPeerIds,
      visibilityForm.accessLevel
    );
    
    // Update local items array
    const existingIndex = items.value.findIndex(item => item.itemId === visibilityForm.itemId);
    if (existingIndex >= 0) {
      items.value[existingIndex] = visibility;
    } else {
      items.value.push(visibility);
    }
    
    showVisibilityDialog.value = false;
    ElMessage.success('Item visibility updated successfully');
    
    // Reset form
    visibilityForm.itemId = '';
    visibilityForm.visibilityType = 'public';
    visibilityForm.accessLevel = 'view';
    visibilityForm.allowedPeerIds = [];
  } catch (error) {
    console.error('Error saving visibility:', error);
    ElMessage.error('Failed to save item visibility');
  }
};

const editItemVisibility = (item: ItemVisibility) => {
  visibilityForm.itemId = item.itemId;
  visibilityForm.visibilityType = item.visibilityType;
  visibilityForm.accessLevel = item.accessLevel;
  visibilityForm.allowedPeerIds = [...item.allowedPeerIds];
  showVisibilityDialog.value = true;
};

const removeItemVisibility = async (itemId: string) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to remove P2P visibility for this item?',
      'Remove Item Visibility',
      {
        confirmButtonText: 'Remove',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    );
    
    // In a real implementation, you'd call a remove method
    items.value = items.value.filter(item => item.itemId !== itemId);
    ElMessage.success('Item visibility removed');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error removing visibility:', error);
      ElMessage.error('Failed to remove item visibility');
    }
  }
};

const getVisibilityType = (type: VisibilityType) => {
  switch (type) {
    case VisibilityType.PUBLIC: return 'success';
    case VisibilityType.PRIVATE: return 'warning';
    case VisibilityType.CUSTOMER_ONLY: return 'info';
    default: return 'info';
  }
};

const getVisibilityLabel = (type: VisibilityType) => {
  switch (type) {
    case VisibilityType.PUBLIC: return 'Public';
    case VisibilityType.PRIVATE: return 'Private';
    case VisibilityType.CUSTOMER_ONLY: return 'Customer Only';
    default: return 'Unknown';
  }
};

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString();
};

// Lifecycle
onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
@import 'src/assets/scss/components/p2p/_p2p-items.scss';
</style>
