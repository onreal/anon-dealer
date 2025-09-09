<template>
  <div class="p2p-test-page">
    <h1>P2P System Test</h1>
    
    <div class="test-section">
      <h2>Database Test</h2>
      <el-button @click="testDatabase" :loading="testingDatabase">
        Test P2P Database
      </el-button>
      <p v-if="databaseTestResult">{{ databaseTestResult }}</p>
    </div>

    <div class="test-section">
      <h2>Peer Creation Test</h2>
      <el-button @click="testPeerCreation" :loading="testingPeer">
        Create Test Peer
      </el-button>
      <p v-if="peerTestResult">{{ peerTestResult }}</p>
    </div>

    <div class="test-section">
      <h2>Invitation Test</h2>
      <el-button @click="testInvitation" :loading="testingInvitation">
        Create Test Invitation
      </el-button>
      <p v-if="invitationTestResult">{{ invitationTestResult }}</p>
    </div>

    <div class="test-section">
      <h2>Current Status</h2>
      <div class="status-info">
        <p><strong>P2P Initialized:</strong> {{ p2pInitialized ? 'Yes' : 'No' }}</p>
        <p><strong>Current Peer:</strong> {{ currentPeer ? currentPeer.name : 'None' }}</p>
        <p><strong>Connections:</strong> {{ connections.length }}</p>
        <p><strong>Orders:</strong> {{ orders.length }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { SimpleP2PService } from '../../application/services/SimpleP2PService';

// Reactive data
const p2pInitialized = ref(false);
const currentPeer = ref<any>(null);
const connections = ref<any[]>([]);
const orders = ref<any[]>([]);

// Test states
const testingDatabase = ref(false);
const testingPeer = ref(false);
const testingInvitation = ref(false);

// Test results
const databaseTestResult = ref('');
const peerTestResult = ref('');
const invitationTestResult = ref('');

// Methods
const loadStatus = async () => {
  try {
    const p2pService = SimpleP2PService.getInstance();
    await p2pService.initialize();
    currentPeer.value = await p2pService.getCurrentPeer();
    connections.value = await p2pService.getConnections();
    orders.value = await p2pService.getP2POrders();
  } catch (error) {
    console.error('Error loading P2P status:', error);
  }
};

const testDatabase = async () => {
  testingDatabase.value = true;
  try {
    const p2pService = SimpleP2PService.getInstance();
    await p2pService.initialize();
    p2pInitialized.value = true;
    databaseTestResult.value = 'P2P Service initialized successfully!';
    ElMessage.success('P2P Service test completed');
  } catch (error) {
    databaseTestResult.value = `P2P Service test failed: ${error}`;
    ElMessage.error('P2P Service test failed');
  } finally {
    testingDatabase.value = false;
  }
};

const testPeerCreation = async () => {
  testingPeer.value = true;
  try {
    const p2pService = SimpleP2PService.getInstance();
    await p2pService.initialize();
    const peer = await p2pService.createPeer('Test Peer ' + Date.now());
    currentPeer.value = peer;
    peerTestResult.value = `Peer created: ${peer.name} (${peer.peerId})`;
    ElMessage.success('Peer created successfully');
    await loadStatus();
  } catch (error) {
    peerTestResult.value = `Peer creation failed: ${error}`;
    ElMessage.error('Peer creation failed');
  } finally {
    testingPeer.value = false;
  }
};

const testInvitation = async () => {
  testingInvitation.value = true;
  try {
    const p2pService = SimpleP2PService.getInstance();
    await p2pService.initialize();
    const invitation = await p2pService.createInvitation('view', 1);
    invitationTestResult.value = `Invitation created: ${invitation.invitationCode}`;
    ElMessage.success('Invitation created successfully');
  } catch (error) {
    invitationTestResult.value = `Invitation creation failed: ${error}`;
    ElMessage.error('Invitation creation failed');
  } finally {
    testingInvitation.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  await loadStatus();
});
</script>

<style scoped>
.p2p-test-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color);
}

.test-section h2 {
  margin-top: 0;
  color: var(--el-text-color-primary);
}

.status-info {
  background: var(--el-fill-color-light);
  padding: 15px;
  border-radius: 6px;
}

.status-info p {
  margin: 8px 0;
  color: var(--el-text-color-regular);
}

.status-info strong {
  color: var(--el-text-color-primary);
}
</style>
