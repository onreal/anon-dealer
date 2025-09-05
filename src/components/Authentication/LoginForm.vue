<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>Welcome Back</h2>
        <p>Your data is safely encrypted on your device</p>
      </div>
      
      <ElForm
          ref="loginFormRef"
          :model="loginForm"
          :rules="rules"
          label-position="top"
          class="login-form"
      >
        <ElFormItem v-if="error" class="error-message">
          <ElAlert
              :title="error"
              type="error"
              :closable="false"
              show-icon
          />
        </ElFormItem>

        <ElFormItem label="PIN" prop="pin">
          <ElInput
              v-model="loginForm.pin"
              type="password"
              placeholder="Enter your PIN"
              show-password
              @keydown.enter="submit"
              :disabled="loading"
          />
        </ElFormItem>

        <ElFormItem>
          <ElButton 
              type="primary" 
              @click="submit"
              :loading="loading"
              :disabled="!loginForm.pin"
              class="login-button"
          >
            {{ loading ? 'Unlocking...' : 'Unlock Data' }}
          </ElButton>
        </ElFormItem>
      </ElForm>

      <div class="login-footer">
        <p class="security-note">
          <ElIcon><Lock /></ElIcon>
          All your data is encrypted locally on this device
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from 'vue'
import { router } from "@/router"
import { ElMessage } from 'element-plus'
import { Lock } from '@element-plus/icons-vue'

export default {
  name: "LoginForm",
  components: {
    Lock
  },
  data() {
    return {
      loginForm: reactive({
        pin: ''
      }),
      loading: false,
      error: null,
      loginFormRef: ref()
    }
  },
  computed: {
    rules() {
      return {
        pin: [
          { required: true, message: 'Please enter your PIN', trigger: 'blur' },
          { min: 4, message: 'PIN must be at least 4 characters', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async submit() {
      if (!this.loginFormRef) return
      
      try {
        await this.loginFormRef.validate()
        this.loading = true
        this.error = null
        
        // Update PIN in Configuration table first
        await this.updateConfigurationPin(this.loginForm.pin)
        
        // Store PIN in localStorage for decryption (jsstore-encrypt plugin uses this)
        localStorage.setItem('anon_pin', this.loginForm.pin)
        
        // Send PIN to worker for encryption/decryption
        this.$sendPinToWorker(this.loginForm.pin)
        
        ElMessage.success('Successfully unlocked!')
        window.location.reload()
      } catch (error) {
        if (error.message) {
          this.error = error.message
        }
      } finally {
        this.loading = false
      }
    },
    
    async updateConfigurationPin(pin) {
      try {
        const configuration = await this.$command.Configuration.getOne()
        if (!configuration) {
          throw new Error('No configuration found. Please register first.')
        }
        
        await this.$command.Configuration.updatePin(configuration.ConfigurationId, pin)
      } catch (error) {
        throw new Error('Invalid PIN. Please try again.')
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: var(--bg-card);
  border-radius: 12px;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border-primary);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: var(--text-primary);
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.login-header p {
  color: var(--text-secondary);
  margin: 0;
  font-size: 14px;
}

.login-form {
  margin-bottom: 20px;
}

.error-message {
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
}

.login-footer {
  text-align: center;
}

.security-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 12px;
  margin: 0;
}

.security-note .el-icon {
  color: #67c23a;
}
</style>
