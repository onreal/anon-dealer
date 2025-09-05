<template>
  <div class="registration-container">
    <div class="registration-card">
      <div class="registration-header">
        <h2>Welcome to Anon Dealer</h2>
        <p>Set up your secure, anonymous business management system</p>
      </div>

      <ElForm
          ref="registrationFormRef"
          :model="registration"
          :rules="rules"
          label-position="top"
          class="registration-form"
      >
        <div class="form-section">
          <h3>Security Setup</h3>
          <ElFormItem label="PIN (Minimum 4 characters)" prop="pin">
            <ElInput
                v-model="registration.pin"
                type="password"
                placeholder="Create a secure PIN"
                show-password
                :disabled="loading"
            />
            <div class="field-hint">This PIN will encrypt all your data locally</div>
          </ElFormItem>
        </div>

        <div class="form-section">
          <h3>Location & Preferences</h3>
          <ElFormItem label="Country" prop="country">
            <ElSelect 
                filterable 
                v-model="registration.country" 
                placeholder="Select your country"
                :disabled="loading"
            >
              <ElOption 
                  v-for="(country, index) in countries" 
                  :key="index" 
                  :label="`${country.name} - ${country.currency.symbol} / ${country.currency.code}`" 
                  :value="country.code" 
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="Timezone" prop="timezone">
            <ElSelect 
                filterable 
                v-model="registration.timezone" 
                placeholder="Select your timezone"
                :disabled="loading"
            >
              <ElOption 
                  v-for="(timezone, index) in getTimezones" 
                  :key="index" 
                  :label="timezone" 
                  :value="timezone" 
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="Business Type" prop="profession">
            <ElSelect 
                v-model="registration.profession" 
                placeholder="What do you sell?"
                :disabled="loading"
            >
              <ElOption 
                  v-for="(profession, index) in professions" 
                  :key="index" 
                  :label="profession.name" 
                  :value="profession.id" 
              />
            </ElSelect>
          </ElFormItem>
        </div>

        <div class="form-section">
          <h3>Privacy Settings</h3>
          <div class="privacy-disclaimer">
            <ElAlert
                title="Your Privacy is Protected"
                description="All your business data will be encrypted and stored locally on this device. No data will be sent to external servers."
                type="info"
                :closable="false"
                show-icon
            />
          </div>

          <ElFormItem label="Are you a friend of the developer?">
            <ElRadioGroup v-model="registration.isAFriendOfMine" :disabled="loading">
              <ElRadio :label="false">No</ElRadio>
              <ElRadio :label="true">Yes</ElRadio>
            </ElRadioGroup>
          </ElFormItem>

          <div v-if="registration.isAFriendOfMine" class="backend-suggestion">
            <ElAlert
                title="Backend Access Available"
                description="As a friend, you can optionally connect to a backend server for additional features."
                type="success"
                :closable="false"
            />
          </div>

          <ElFormItem label="Use Backend Server?">
            <ElRadioGroup v-model="registration.isBackend" :disabled="loading">
              <ElRadio :label="false">No, keep everything local</ElRadio>
              <ElRadio :label="true">Yes, connect to backend</ElRadio>
            </ElRadioGroup>
          </ElFormItem>

          <template v-if="registration.isBackend">
            <ElFormItem label="Backend URL" prop="backendUrl">
              <ElInput 
                  placeholder="https://your-backend.com" 
                  v-model="registration.backendUrl"
                  :disabled="loading"
              />
            </ElFormItem>

            <ElFormItem label="Backend Token" prop="backendToken">
              <ElInput 
                  placeholder="Your authentication token" 
                  v-model="registration.backendToken"
                  :disabled="loading"
              />
            </ElFormItem>
          </template>
        </div>

        <div class="form-section">
          <ElFormItem prop="isAgree">
            <ElCheckbox v-model="registration.isAgree" :disabled="loading">
              I understand that this application stores data locally and encrypted on my device
            </ElCheckbox>
          </ElFormItem>
        </div>

        <ElFormItem>
          <ElButton 
              type="primary" 
              @click="submit"
              :loading="loading"
              :disabled="!registration.isAgree"
              class="submit-button"
          >
            {{ loading ? 'Setting up...' : 'Complete Setup' }}
          </ElButton>
        </ElFormItem>
      </ElForm>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from 'vue'
import { router } from "@/router"
import { ElMessage } from 'element-plus'
import professions from '@/data/professions.json'
import countries from '@/data/countries.json'
import timezones from '@/data/timezones.json'

export default {
  name: "RegistrationForm",
  data() {
    return {
      registration: reactive({
        pin: '',
        country: '',
        timezone: '',
        profession: '',
        isAFriendOfMine: false,
        isBackend: false,
        isAgree: false,
        backendUrl: '',
        backendToken: ''
      }),
      loading: false,
      registrationFormRef: null,
      professions, 
      countries, 
      timezones
    }
  },
  computed: {
    rules() {
      return {
        pin: [
          { required: true, message: 'Please create a PIN', trigger: 'blur' },
          { min: 4, message: 'PIN must be at least 4 characters', trigger: 'blur' }
        ],
        country: [
          { required: true, message: 'Please select your country', trigger: 'change' }
        ],
        timezone: [
          { required: true, message: 'Please select your timezone', trigger: 'change' }
        ],
        profession: [
          { required: true, message: 'Please select your business type', trigger: 'change' }
        ],
        backendUrl: [
          { 
            required: this.registration.isBackend, 
            message: 'Backend URL is required when using backend', 
            trigger: 'blur' 
          }
        ],
        backendToken: [
          { 
            required: this.registration.isBackend, 
            message: 'Backend token is required when using backend', 
            trigger: 'blur' 
          }
        ],
        isAgree: [
          { 
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error('You must agree to the terms'))
              } else {
                callback()
              }
            }, 
            trigger: 'change' 
          }
        ]
      }
    },
    getTimezones() {
      if (this.registration.country && this.timezones[this.registration.country]) {
        return this.timezones[this.registration.country]
      }
      return []
    }
  },
  watch: {
    'registration.country'() {
      this.registration.timezone = ''
    },
    'registration.isBackend'(newVal) {
      if (!newVal) {
        this.registration.backendUrl = ''
        this.registration.backendToken = ''
      }
    }
  },
  methods: {
    async submit() {
      console.log('Submit button clicked!')
      console.log('Available refs:', Object.keys(this.$refs))
      console.log('registrationFormRef:', this.registrationFormRef)
      console.log('$refs.registrationFormRef:', this.$refs.registrationFormRef)
      
      const formRef = this.$refs.registrationFormRef || this.registrationFormRef
      if (!formRef) {
        console.log('No form ref found')
        return
      }
      
      try {
        console.log('Validating form...')
        await formRef.validate()
        console.log('Form validation passed')
        this.loading = true
        
        // Check if already configured
        const existingConfig = await this.$command.Configuration.getOne()
        if (existingConfig) {
          ElMessage.warning('Application is already configured')
          await router.push({ name: 'Dashboard' })
          return
        }

        // Create configuration
        const configuration = await this.$command.Configuration.add({
          Pin: this.registration.pin,
          State: 'REGISTERED',
          CreatedOn: new Date(),
          LastLogin: new Date()
        })

        // Get country details
        const country = await this.getCountry(this.registration.country)

        // Create settings
        const settings = {
          IsBackend: this.registration.isBackend,
          ServerUrl: this.registration.backendUrl,
          ServerToken: this.registration.backendToken,
          Profession: this.registration.profession,
          IsAFriendOfMine: this.registration.isAFriendOfMine,
          Country: country.name,
          Currency: country.currency.code,
          Language: country.code,
          Timezone: this.registration.timezone,
          CreatedOn: new Date(),
          ModifiedOn: new Date()
        }

        await this.$command.Settings.add(settings)

        // Store PIN in localStorage for decryption
        localStorage.setItem('anon_pin', this.registration.pin)
        
        // Send PIN to worker for encryption/decryption
        this.$sendPinToWorker(this.registration.pin)

        ElMessage.success('Setup completed successfully!')
        await router.push({ name: 'Dashboard' })
        
      } catch (error) {
        console.error('Registration error:', error)
        console.error('Error details:', error.message)
        ElMessage.error(`Setup failed: ${error.message}`)
      } finally {
        this.loading = false
      }
    },
    
    async getCountry(code) {
      const country = this.countries.find(country => country.code === code)
      if (!country) {
        throw new Error('Country not found')
      }
      return JSON.parse(JSON.stringify(country))
    }
  }
}
</script>

<script setup>

</script>

<style scoped>
.registration-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.registration-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 600px;
  margin-top: 20px;
}

.registration-header {
  text-align: center;
  margin-bottom: 30px;
}

.registration-header h2 {
  color: #2c3e50;
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.registration-header p {
  color: #7f8c8d;
  margin: 0;
  font-size: 14px;
}

.registration-form {
  margin-bottom: 20px;
}

.form-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
}

.form-section h3 {
  color: #2c3e50;
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
}

.field-hint {
  font-size: 12px;
  color: #7f8c8d;
  margin-top: 4px;
}

.privacy-disclaimer {
  margin-bottom: 20px;
}

.backend-suggestion {
  margin: 15px 0;
}

.submit-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-form-item__label {
  font-weight: 600;
  color: #2c3e50;
}

.el-input, .el-select {
  width: 100%;
}

.el-radio-group {
  display: flex;
  gap: 20px;
}

.el-checkbox {
  font-size: 14px;
}
</style>
