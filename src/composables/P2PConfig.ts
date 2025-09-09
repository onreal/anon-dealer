import { ref, computed } from 'vue'
import { environment } from '@/config/environment'

export interface P2PConfiguration {
  isP2PEnabled: boolean
  signalingServerUrl: string
  signalingServerWsUrl: string
  p2pDefaultRoom: string
}

export function useP2PConfig() {
  const config = ref<P2PConfiguration>({
    isP2PEnabled: false,
    signalingServerUrl: '',
    signalingServerWsUrl: '',
    p2pDefaultRoom: 'anon-dealer-network'
  })

  const isP2PEnabled = computed(() => config.value.isP2PEnabled)
  const signalingServerUrl = computed(() => config.value.signalingServerUrl)
  const signalingServerWsUrl = computed(() => config.value.signalingServerWsUrl)
  const p2pDefaultRoom = computed(() => config.value.p2pDefaultRoom)

  const getDefaultSignalingServerUrl = () => {
    return environment.DEFAULT_SIGNALING_SERVER_URL
  }

  const getDefaultSignalingServerWsUrl = () => {
    return environment.DEFAULT_SIGNALING_SERVER_WS_URL
  }

  const loadFromConfiguration = async (configuration: any) => {
    if (configuration) {
      config.value = {
        isP2PEnabled: configuration.IsP2PEnabled || false,
        signalingServerUrl: configuration.SignalingServerUrl || getDefaultSignalingServerUrl(),
        signalingServerWsUrl: configuration.SignalingServerWsUrl || getDefaultSignalingServerWsUrl(),
        p2pDefaultRoom: configuration.P2PDefaultRoom || 'anon-dealer-network'
      }
    }
  }

  const loadFromSettings = async (settings: any) => {
    if (settings) {
      config.value = {
        isP2PEnabled: settings.IsP2PEnabled || false,
        signalingServerUrl: settings.SignalingServerUrl || getDefaultSignalingServerUrl(),
        signalingServerWsUrl: settings.SignalingServerWsUrl || getDefaultSignalingServerWsUrl(),
        p2pDefaultRoom: settings.P2PDefaultRoom || 'anon-dealer-network'
      }
    }
  }

  const updateConfiguration = (newConfig: Partial<P2PConfiguration>) => {
    config.value = { ...config.value, ...newConfig }
  }

  const getWebSocketUrl = () => {
    if (!config.value.isP2PEnabled) return null
    
    const baseUrl = config.value.signalingServerUrl || getDefaultSignalingServerUrl()
    const wsUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://')
    return `${wsUrl}/socket.io/`
  }

  const getHttpUrl = () => {
    if (!config.value.isP2PEnabled) return null
    return config.value.signalingServerUrl || getDefaultSignalingServerUrl()
  }

  return {
    config: config.value,
    isP2PEnabled,
    signalingServerUrl,
    signalingServerWsUrl,
    p2pDefaultRoom,
    getDefaultSignalingServerUrl,
    getDefaultSignalingServerWsUrl,
    loadFromConfiguration,
    loadFromSettings,
    updateConfiguration,
    getWebSocketUrl,
    getHttpUrl
  }
}
