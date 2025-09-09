<template>
  <div class="app-initialization">
    <div class="initialization-container">
      <div class="logo-section">
        <div class="logo">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Main circle -->
            <circle cx="40" cy="40" r="35" fill="#3b82f6" opacity="0.1"/>
            <circle cx="40" cy="40" r="35" stroke="#3b82f6" stroke-width="2"/>
            
            <!-- Anonymous mask icon -->
            <circle cx="40" cy="32" r="12" fill="#3b82f6" opacity="0.8"/>
            <path d="M28 32c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="#ffffff" stroke-width="2" fill="none"/>
            
            <!-- Business elements -->
            <rect x="32" y="48" width="16" height="8" rx="2" fill="#3b82f6" opacity="0.6"/>
            <rect x="30" y="56" width="20" height="4" rx="2" fill="#3b82f6" opacity="0.4"/>
            
            <!-- Security shield -->
            <path d="M40 20l-4 4v8c0 4 4 8 4 8s4-4 4-8v-8l-4-4z" fill="#3b82f6" opacity="0.7"/>
            <path d="M36 28l2 2 4-4" stroke="#ffffff" stroke-width="1.5" fill="none"/>
          </svg>
        </div>
        <h1 class="app-title">Anon Dealer</h1>
        <p class="app-subtitle">Anonymous Business Management</p>
      </div>

      <div class="loading-section">
        <div class="loading-spinner">
          <div class="spinner"></div>
        </div>
        <h2 class="loading-title">Initializing Application</h2>
        <p class="loading-description">
          Please wait while we prepare your secure environment...
        </p>
        
        <div class="progress-steps">
          <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
            <div class="step-icon">
              <el-icon v-if="currentStep > 1"><Check /></el-icon>
              <span v-else>1</span>
            </div>
            <span class="step-text">Loading Database</span>
          </div>
          
          <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
            <div class="step-icon">
              <el-icon v-if="currentStep > 2"><Check /></el-icon>
              <span v-else>2</span>
            </div>
            <span class="step-text">Initializing Encryption</span>
          </div>
          
          <div class="step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
            <div class="step-icon">
              <el-icon v-if="currentStep > 3"><Check /></el-icon>
              <span v-else>3</span>
            </div>
            <span class="step-text">Preparing Commands</span>
          </div>
          
          <div class="step" :class="{ active: currentStep >= 4, completed: currentStep > 4 }">
            <div class="step-icon">
              <el-icon v-if="currentStep > 4"><Check /></el-icon>
              <span v-else>4</span>
            </div>
            <span class="step-text">Ready to Launch</span>
          </div>
        </div>
      </div>

      <div class="approval-section" v-if="showApproval">
        <div class="approval-content">
          <h3>Security Notice</h3>
          <p>
            Your application is initializing with encrypted data storage. 
            This process ensures your business data remains secure and private.
          </p>
          <el-button 
            type="primary" 
            size="large" 
            :loading="isApproving"
            @click="approveInitialization"
          >
            Continue to Application
          </el-button>
        </div>
      </div>

      <div class="completion-section" v-if="currentStep === 4 && !showApproval">
        <div class="completion-content">
          <div class="completion-icon">
            <el-icon><Check /></el-icon>
          </div>
          <h3>Initialization Complete!</h3>
          <p>
            Your secure environment is ready. Redirecting to your dashboard...
          </p>
        </div>
      </div>

      <div class="error-section" v-if="hasError">
        <div class="error-content">
          <el-icon class="error-icon"><Warning /></el-icon>
          <h3>Initialization Error</h3>
          <p>{{ errorMessage }}</p>
          <el-button type="primary" @click="retryInitialization">
            Retry
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElIcon, ElButton } from 'element-plus'
import { Check, Warning } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const currentStep = ref(0)
const showApproval = ref(false)
const isApproving = ref(false)
const hasError = ref(false)
const errorMessage = ref('')
const originalRoute = ref('')

let checkInterval: NodeJS.Timeout | null = null
let timeoutId: NodeJS.Timeout | null = null

const emit = defineEmits<{
  initialized: []
  error: [message: string]
}>()

onMounted(() => {
  // Get target route from query parameters or default to dashboard
  originalRoute.value = (route.query.target as string) || '/dashboard'
  startInitialization()
})

onUnmounted(() => {
  if (checkInterval) {
    clearInterval(checkInterval)
  }
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
})

const startInitialization = () => {
  
  // Simulate initialization steps
  currentStep.value = 1
  
  // Check for worker readiness every 100ms
  checkInterval = setInterval(() => {
    checkWorkerStatus()
  }, 100)
  
  // Set a timeout to show approval if worker takes too long
  timeoutId = setTimeout(() => {
    if (currentStep.value < 4) {
      showApproval.value = true
    }
  }, 3000)
}

const checkWorkerStatus = () => {
  try {
    const globals = (window as any).__VUE_APP_GLOBALS__
    
    if (globals && globals.$command) {
      currentStep.value = 4
      
      if (checkInterval) {
        clearInterval(checkInterval)
        checkInterval = null
      }
      
      // Auto-navigate after a short delay to show completion
      setTimeout(() => {
        autoNavigate()
      }, 1000)
    } else {
      // Simulate progress
      if (currentStep.value < 3) {
        currentStep.value++
      }
    }
  } catch (error) {
    console.error('Error checking worker status:', error)
    handleError('Failed to check worker status')
  }
}

const autoNavigate = async () => {
  try {
    emit('initialized')
    
    // Redirect to the original route
    await router.push(originalRoute.value)
  } catch (error) {
    console.error('Error during auto-navigation:', error)
    handleError('Failed to navigate to target page')
  }
}

const approveInitialization = async () => {
  isApproving.value = true
  
  try {
    // Wait a bit more to ensure everything is ready
    await new Promise(resolve => setTimeout(resolve, 500))
    
    emit('initialized')
    
    // Redirect to the original route
    await router.push(originalRoute.value)
  } catch (error) {
    console.error('Error during approval:', error)
    handleError('Failed to complete initialization')
  } finally {
    isApproving.value = false
  }
}

const retryInitialization = () => {
  hasError.value = false
  errorMessage.value = ''
  currentStep.value = 0
  showApproval.value = false
  startInitialization()
}

const handleError = (message: string) => {
  hasError.value = true
  errorMessage.value = message
  emit('error', message)
  
  if (checkInterval) {
    clearInterval(checkInterval)
    checkInterval = null
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/components/loading/_app-initialization.scss';
</style>
