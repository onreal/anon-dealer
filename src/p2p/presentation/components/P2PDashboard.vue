<template>
  <div class="p2p-dashboard">
    <!-- Header -->
    <div class="p2p-header">
      <h1>P2P Network</h1>
      <div class="p2p-status">
        <!-- Signaling Server Status -->
        <div class="signaling-status">
          <el-tooltip 
            :content="getSignalingTooltipText()" 
            placement="top"
          >
            <el-tag 
              :type="signalingStatus === 'connected' ? 'success' : signalingStatus === 'connecting' ? 'warning' : 'danger'"
              :icon="getSignalingIcon()"
            >
              {{ getSignalingStatusText() }}
            </el-tag>
          </el-tooltip>
          <el-tooltip content="Refresh signaling server status" placement="top">
            <el-button 
              size="small" 
              type="primary" 
              :icon="Loading"
              :loading="signalingStatus === 'connecting'"
              @click="checkSignalingServerStatus"
              circle
            />
          </el-tooltip>
        </div>
        
        <!-- Peer Status -->
        <el-tag :type="isOnline ? 'success' : 'danger'">
          {{ isOnline ? 'Online' : 'Offline' }}
        </el-tag>
        <span class="peer-name">{{ currentPeer?.name || 'No Peer' }}</span>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <el-button type="primary" @click="showCreatePeerDialog = true" v-if="!currentPeer">
        <el-icon><User /></el-icon>
        Create Peer Identity
      </el-button>
      
      <el-button type="success" @click="showInviteDialog = true" v-if="currentPeer">
        <el-icon><Share /></el-icon>
        Create Invitation
      </el-button>
      
      <el-button type="info" @click="showAcceptDialog = true" v-if="currentPeer">
        <el-icon><Key /></el-icon>
        Accept Invitation
      </el-button>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid" v-if="currentPeer">
      <!-- Signaling Server Status Card -->
      <div class="stat-card signaling-card" :class="signalingStatus">
        <div class="stat-icon">
          <el-icon><CircleCheck v-if="signalingStatus === 'connected'" /><CircleClose v-else-if="signalingStatus === 'error'" /><Loading v-else /></el-icon>
        </div>
        <div class="stat-content">
          <h3>{{ getSignalingStatusText() }}</h3>
          <p>Signaling Server</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><Connection /></el-icon>
        </div>
        <div class="stat-content">
          <h3>{{ activeConnections.length }}</h3>
          <p>Active Connections</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><Box /></el-icon>
        </div>
        <div class="stat-content">
          <h3>{{ visibleItems.length }}</h3>
          <p>Visible Items</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><List /></el-icon>
        </div>
        <div class="stat-content">
          <h3>{{ p2pOrders.length }}</h3>
          <p>P2P Orders</p>
        </div>
      </div>
    </div>

    <!-- Connections List -->
    <div class="connections-section" v-if="currentPeer && activeConnections.length > 0">
      <h2>Active Connections</h2>
      <div class="connections-grid">
        <div 
          v-for="connection in activeConnections" 
          :key="connection.connectionId"
          class="connection-card"
        >
          <div class="connection-info">
            <h4>{{ getPeerName(connection) }}</h4>
            <p>Access Level: {{ connection.accessLevel }}</p>
            <p>Connected: {{ formatDate(connection.createdAt) }}</p>
          </div>
          <div class="connection-actions">
            <el-button 
              type="danger" 
              size="small" 
              @click="disconnectPeer(connection.connectionId)"
            >
              Disconnect
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="orders-section" v-if="currentPeer && p2pOrders.length > 0">
      <h2>Recent P2P Orders</h2>
      <el-table :data="recentOrders" style="width: 100%">
        <el-table-column prop="orderId" label="Order ID" width="120" />
        <el-table-column prop="itemId" label="Item" width="100" />
        <el-table-column prop="quantity" label="Qty" width="80" />
        <el-table-column prop="price" label="Price" width="100" />
        <el-table-column prop="status" label="Status" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Created" width="150">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Empty State -->
    <div class="empty-state" v-if="currentPeer && activeConnections.length === 0">
      <el-icon class="empty-icon"><Connection /></el-icon>
      <h3>No Active Connections</h3>
      <p>Create an invitation or accept one to start connecting with other peers.</p>
    </div>

    <!-- Create Peer Dialog -->
    <el-dialog v-model="showCreatePeerDialog" title="Create Peer Identity" width="400px">
      <el-form :model="peerForm" :rules="peerRules" ref="peerFormRef">
        <el-form-item label="Peer Name" prop="name">
          <el-input v-model="peerForm.name" placeholder="Enter peer name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreatePeerDialog = false">Cancel</el-button>
        <el-button type="primary" @click="createPeer">Create</el-button>
      </template>
    </el-dialog>

    <!-- Create Invitation Dialog -->
    <el-dialog v-model="showInviteDialog" title="Create Invitation" width="400px">
      <el-form :model="inviteForm" :rules="inviteRules" ref="inviteFormRef">
        <el-form-item label="Access Level" prop="accessLevel">
          <el-select v-model="inviteForm.accessLevel" placeholder="Select access level">
            <el-option label="View Only" value="view" />
            <el-option label="Can Order" value="order" />
            <el-option label="Full Management" value="manage" />
          </el-select>
        </el-form-item>
        <el-form-item label="Expires In" prop="expiresInHours">
          <el-input-number 
            v-model="inviteForm.expiresInHours" 
            :min="1" 
            :max="168" 
            placeholder="Hours"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showInviteDialog = false">Cancel</el-button>
        <el-button type="primary" @click="createInvitation">Create</el-button>
      </template>
    </el-dialog>

    <!-- Accept Invitation Dialog -->
    <el-dialog v-model="showAcceptDialog" title="Accept Invitation" width="400px">
      <el-form :model="acceptForm" :rules="acceptRules" ref="acceptFormRef">
        <el-form-item label="Invitation Code" prop="invitationCode">
          <el-input 
            v-model="acceptForm.invitationCode" 
            placeholder="Enter invitation code"
            style="font-family: monospace;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAcceptDialog = false">Cancel</el-button>
        <el-button type="primary" @click="acceptInvitation">Accept</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { User, Share, Key, Connection, Box, List, CircleCheck, CircleClose, Loading } from '@element-plus/icons-vue';
import { SimpleP2PService } from '../../application/services/SimpleP2PService';
import { WebRTCService } from '../../infrastructure/communication/WebRTCService';
import { Peer, PeerConnection, P2POrder, AccessLevel } from '../../domain/models/Peer';

// Reactive data
const p2pService = SimpleP2PService.getInstance();
const webRTCService = WebRTCService.getInstance();
const currentPeer = ref<Peer | null>(null);
const activeConnections = ref<PeerConnection[]>([]);
const visibleItems = ref<string[]>([]);
const p2pOrders = ref<P2POrder[]>([]);
const isOnline = ref(false);
const signalingStatus = ref<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

// Dialog states
const showCreatePeerDialog = ref(false);
const showInviteDialog = ref(false);
const showAcceptDialog = ref(false);

// Form data
const peerForm = reactive({
  name: ''
});

const inviteForm = reactive({
  accessLevel: 'view' as AccessLevel,
  expiresInHours: 24
});

const acceptForm = reactive({
  invitationCode: ''
});

// Form refs
const peerFormRef = ref();
const inviteFormRef = ref();
const acceptFormRef = ref();

// Form rules
const peerRules = {
  name: [
    { required: true, message: 'Please enter peer name', trigger: 'blur' },
    { min: 2, max: 50, message: 'Name must be between 2 and 50 characters', trigger: 'blur' }
  ]
};

const inviteRules = {
  accessLevel: [
    { required: true, message: 'Please select access level', trigger: 'change' }
  ],
  expiresInHours: [
    { required: true, message: 'Please enter expiration hours', trigger: 'blur' },
    { type: 'number', min: 1, max: 168, message: 'Must be between 1 and 168 hours', trigger: 'blur' }
  ]
};

const acceptRules = {
  invitationCode: [
    { required: true, message: 'Please enter invitation code', trigger: 'blur' },
    { pattern: /^AD-[A-Z0-9]{4}-[A-Z0-9]{4}$/, message: 'Invalid invitation code format', trigger: 'blur' }
  ]
};

// Computed properties
const recentOrders = computed(() => {
  return p2pOrders.value
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
});

// Methods
const checkSignalingServerStatus = async () => {
  try {
    signalingStatus.value = 'connecting';
    
    // Check if we have a current peer
    if (!currentPeer.value) {
      signalingStatus.value = 'disconnected';
      return;
    }
    
    // Use a simple fetch request to test connectivity
    // We'll use a method that doesn't trigger CORS preflight
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    try {
      // Use a simple GET request that should work even with CORS
      const response = await fetch('http://localhost:8080/health', {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors', // Try CORS first
        credentials: 'omit'
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        signalingStatus.value = 'connected';
        return;
      } else {
        throw new Error('Server responded with error');
      }
    } catch (corsError) {
      clearTimeout(timeoutId);
      
      // If CORS fails, try with no-cors mode
      try {
        const response = await fetch('http://localhost:8080/health', {
          method: 'GET',
          signal: controller.signal,
          mode: 'no-cors'
        });
        
        // With no-cors, we can't read the response, but if it doesn't throw, server is reachable
        signalingStatus.value = 'connected';
        return;
      } catch (noCorsError) {
        throw new Error('Server not reachable');
      }
    }
  } catch (error) {
    // Log the actual error for debugging
    console.error('Signaling server connection failed:', error);
    signalingStatus.value = 'error';
  }
};

const getSignalingStatusText = () => {
  switch (signalingStatus.value) {
    case 'connected':
      return 'Signaling Server Online';
    case 'connecting':
      return 'Checking Connection...';
    case 'error':
      return 'Signaling Server Offline';
    default:
      return 'Not Connected';
  }
};

const getSignalingIcon = () => {
  switch (signalingStatus.value) {
    case 'connected':
      return CircleCheck;
    case 'connecting':
      return Loading;
    case 'error':
      return CircleClose;
    default:
      return CircleClose;
  }
};

const getSignalingTooltipText = () => {
  switch (signalingStatus.value) {
    case 'connected':
      return 'Signaling server is running and accessible. P2P connections can be established.';
    case 'connecting':
      return 'Checking connection to signaling server...';
    case 'error':
      return 'Cannot connect to signaling server. Check if server is running on port 8080.';
    default:
      return 'No peer identity created. Create a peer to enable P2P functionality.';
  }
};

const loadData = async () => {
  try {
    if (!p2pService) {
      console.error('P2P Service not available');
      return;
    }
    
    await p2pService.initialize();
    currentPeer.value = await p2pService.getCurrentPeer();
    if (currentPeer.value) {
      activeConnections.value = await p2pService.getActiveConnections();
      visibleItems.value = await p2pService.getVisibleItems();
      p2pOrders.value = await p2pService.getP2POrders();
      isOnline.value = true;
      
      // Check signaling server status
      await checkSignalingServerStatus();
    }
  } catch (error) {
    console.error('Error loading P2P data:', error);
    // Don't show error message to avoid breaking the UI
  }
};

const createPeer = async () => {
  try {
    if (peerFormRef.value) {
      await peerFormRef.value.validate();
    }
    const peer = await p2pService.createPeer(peerForm.name);
    currentPeer.value = peer;
    isOnline.value = true;
    showCreatePeerDialog.value = false;
    peerForm.name = '';
    ElMessage.success('Peer created successfully');
    await loadData();
  } catch (error) {
    console.error('Error creating peer:', error);
    ElMessage.error('Failed to create peer');
  }
};

const createInvitation = async () => {
  try {
    if (inviteFormRef.value) {
      await inviteFormRef.value.validate();
    }
    const invitation = await p2pService.createInvitation(
      inviteForm.accessLevel, 
      inviteForm.expiresInHours
    );
    showInviteDialog.value = false;
    
    // Show invitation code to user
    ElMessageBox.alert(
      `Invitation Code: ${invitation.invitationCode}`,
      'Invitation Created',
      {
        confirmButtonText: 'Copy Code',
        callback: () => {
          navigator.clipboard.writeText(invitation.invitationCode);
          ElMessage.success('Invitation code copied to clipboard');
        }
      }
    );
    
    inviteForm.accessLevel = 'view';
    inviteForm.expiresInHours = 24;
  } catch (error) {
    console.error('Error creating invitation:', error);
    ElMessage.error('Failed to create invitation');
  }
};

const acceptInvitation = async () => {
  try {
    if (acceptFormRef.value) {
      await acceptFormRef.value.validate();
    }
    const connection = await p2pService.acceptInvitation(
      acceptForm.invitationCode, 
      currentPeer.value?.name || 'Unknown'
    );
    showAcceptDialog.value = false;
    acceptForm.invitationCode = '';
    ElMessage.success('Invitation accepted successfully');
    await loadData();
  } catch (error) {
    console.error('Error accepting invitation:', error);
    ElMessage.error(error instanceof Error ? error.message : 'Failed to accept invitation');
  }
};

const disconnectPeer = async (connectionId: string) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to disconnect from this peer?',
      'Disconnect Peer',
      {
        confirmButtonText: 'Disconnect',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    );
    
    await p2pService.disconnectPeer(connectionId);
    ElMessage.success('Peer disconnected');
    await loadData();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error disconnecting peer:', error);
      ElMessage.error('Failed to disconnect peer');
    }
  }
};

const getPeerName = (connection: PeerConnection): string => {
  // In a real implementation, you'd fetch the peer name from the other peer
  return `Peer ${connection.peerAId === currentPeer.value?.peerId ? connection.peerBId : connection.peerAId}`;
};

const getStatusType = (status: string) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'confirmed': return 'info';
    case 'shipped': return 'primary';
    case 'delivered': return 'success';
    case 'cancelled': return 'danger';
    default: return 'info';
  }
};

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString();
};

// Periodic status check
let statusCheckInterval: NodeJS.Timeout | null = null;

const startStatusCheck = () => {
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval);
  }
  
  // Initial check after a short delay
  setTimeout(async () => {
    if (currentPeer.value) {
      await checkSignalingServerStatus();
    }
  }, 1000);
  
  // Then check every 15 seconds
  statusCheckInterval = setInterval(async () => {
    if (currentPeer.value) {
      await checkSignalingServerStatus();
    }
  }, 15000);
};

const stopStatusCheck = () => {
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval);
    statusCheckInterval = null;
  }
};

// Lifecycle
onMounted(async () => {
  try {
    await loadData();
    startStatusCheck();
  } catch (error) {
    console.error('Error in P2P Dashboard onMounted:', error);
  }
});

onUnmounted(() => {
  stopStatusCheck();
});
</script>

<style lang="scss" scoped>
@import 'src/assets/scss/components/p2p/_p2p-dashboard.scss';
</style>
