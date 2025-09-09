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
      loginFormRef: null
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
      console.log('Login submit button clicked!')
      console.log('Available refs:', Object.keys(this.$refs))
      console.log('loginFormRef:', this.loginFormRef)
      console.log('$refs.loginFormRef:', this.$refs.loginFormRef)
      
      const formRef = this.$refs.loginFormRef || this.loginFormRef
      if (!formRef) {
        console.log('No form ref found')
        return
      }
      
      try {
        console.log('Validating form...')
        await formRef.validate()
        console.log('Form validation passed')
        this.loading = true
        this.error = null
        
        // Update PIN in Configuration table first
        await this.updateConfigurationPin(this.loginForm.pin)
        
        // Store PIN in localStorage for decryption (jsstore-encrypt plugin uses this)
        localStorage.setItem('anon_pin', this.loginForm.pin)
        
        // Send PIN to worker for encryption/decryption
        this.$sendPinToWorker(this.loginForm.pin)
        
        ElMessage.success('Successfully unlocked!')
        await router.push({ name: 'Dashboard' })
      } catch (error) {
        console.error('Login error:', error)
        console.error('Error details:', error.message)
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

<!-- Styles are now in /src/assets/scss/components/authentication/_login-form.scss -->
