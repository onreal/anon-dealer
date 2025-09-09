<template>
  <div class="p2p-configuration">
    <h3>P2P Network Configuration</h3>
    
    <ElForm :model="p2pConfig" label-position="top" class="p2p-form">
      <ElFormItem label="Enable P2P Network">
        <ElSwitch 
          v-model="p2pConfig.isP2PEnabled" 
          :disabled="loading"
          @change="onP2PToggle"
        />
        <div class="field-hint">
          Connect to other Anon Dealer users for secure, decentralized business transactions
        </div>
      </ElFormItem>

      <template v-if="p2pConfig.isP2PEnabled">
        <ElFormItem label="Signaling Server URL" prop="signalingServerUrl">
          <ElInput 
            v-model="p2pConfig.signalingServerUrl"
            placeholder="http://localhost:8080"
            :disabled="loading"
          />
          <div class="field-hint">
            Leave empty to use default server: {{ defaultSignalingServerUrl }}
          </div>
        </ElFormItem>

        <ElFormItem label="P2P Network Room" prop="p2pDefaultRoom">
          <ElInput 
            v-model="p2pConfig.p2pDefaultRoom"
            placeholder="anon-dealer-network"
            :disabled="loading"
          />
          <div class="field-hint">
            Room name for P2P connections
          </div>
        </ElFormItem>

        <ElFormItem label="Connection Status">
          <ElTag :type="connectionStatus.type" :effect="connectionStatus.effect">
            {{ connectionStatus.text }}
          </ElTag>
        </ElFormItem>
      </template>
    </ElForm>

    <div class="p2p-actions">
      <ElButton 
        type="primary" 
        @click="saveConfiguration"
        :loading="loading"
        :disabled="!p2pConfig.isP2PEnabled"
      >
        Save P2P Configuration
      </ElButton>
      
      <ElButton 
        v-if="p2pConfig.isP2PEnabled"
        type="success" 
        @click="testConnection"
        :loading="testingConnection"
      >
        Test Connection
      </ElButton>
    </div>
  </div>
</template>

<script>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useP2PConfig } from '@/composables/P2PConfig'

export default {
  name: 'P2PConfiguration',
  setup() {
    const p2pConfigComposable = useP2PConfig()
    const loading = ref(false)
    const testingConnection = ref(false)
    const connectionStatus = ref({
      type: 'info',
      effect: 'plain',
      text: 'Not connected'
    })

    const p2pConfig = reactive({
      isP2PEnabled: false,
      signalingServerUrl: '',
      p2pDefaultRoom: 'anon-dealer-network'
    })

    const defaultSignalingServerUrl = p2pConfigComposable.getDefaultSignalingServerUrl()

    const loadConfiguration = async () => {
      try {
        // Load from settings
        const settings = await this.$command.Settings.getOne()
        if (settings) {
          p2pConfig.isP2PEnabled = settings.IsP2PEnabled || false
          p2pConfig.signalingServerUrl = settings.SignalingServerUrl || ''
          p2pConfig.p2pDefaultRoom = settings.P2PDefaultRoom || 'anon-dealer-network'
        }
      } catch (error) {
        console.error('Error loading P2P configuration:', error)
      }
    }

    const onP2PToggle = (enabled) => {
      if (!enabled) {
        p2pConfig.signalingServerUrl = ''
        p2pConfig.p2pDefaultRoom = 'anon-dealer-network'
        connectionStatus.value = {
          type: 'info',
          effect: 'plain',
          text: 'P2P disabled'
        }
      }
    }

    const saveConfiguration = async () => {
      loading.value = true
      try {
        const settings = await this.$command.Settings.getOne()
        if (settings) {
          const updatedSettings = {
            ...settings,
            IsP2PEnabled: p2pConfig.isP2PEnabled,
            SignalingServerUrl: p2pConfig.signalingServerUrl || defaultSignalingServerUrl,
            P2PDefaultRoom: p2pConfig.p2pDefaultRoom,
            ModifiedOn: new Date()
          }
          
          await this.$command.Settings.update(updatedSettings)
          ElMessage.success('P2P configuration saved successfully')
        }
      } catch (error) {
        console.error('Error saving P2P configuration:', error)
        ElMessage.error('Failed to save P2P configuration')
      } finally {
        loading.value = false
      }
    }

    const testConnection = async () => {
      testingConnection.value = true
      try {
        const serverUrl = p2pConfig.signalingServerUrl || defaultSignalingServerUrl
        const response = await fetch(`${serverUrl}/health`)
        
        if (response.ok) {
          connectionStatus.value = {
            type: 'success',
            effect: 'dark',
            text: 'Connected'
          }
          ElMessage.success('Connection test successful')
        } else {
          throw new Error('Server responded with error')
        }
      } catch (error) {
        connectionStatus.value = {
          type: 'danger',
          effect: 'dark',
          text: 'Connection failed'
        }
        ElMessage.error('Connection test failed')
      } finally {
        testingConnection.value = false
      }
    }

    onMounted(() => {
      loadConfiguration()
    })

    return {
      p2pConfig,
      loading,
      testingConnection,
      connectionStatus,
      defaultSignalingServerUrl,
      onP2PToggle,
      saveConfiguration,
      testConnection
    }
  }
}
</script>

<style scoped>
.p2p-configuration {
  padding: 20px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color);
}

.p2p-form {
  margin-bottom: 20px;
}

.field-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.p2p-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .p2p-actions {
    flex-direction: column;
  }
  
  .p2p-actions .el-button {
    width: 100%;
  }
}
</style>
