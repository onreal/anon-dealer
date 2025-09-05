<template>
  <el-drawer
    v-model="visible"
    :title="isEditing ? 'Edit Customer' : 'Add New Customer'"
    direction="rtl"
    size="400px"
    class="customer-drawer"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="customer-form"
    >
      <!-- Customer Name -->
      <el-form-item label="Customer Name" prop="Name">
        <el-input
          v-model="form.Name"
          placeholder="Enter customer name"
          size="large"
          class="form-input"
        />
      </el-form-item>

      <!-- Email -->
      <el-form-item label="Email" prop="Email">
        <el-input
          v-model="form.Email"
          type="email"
          placeholder="Enter email address"
          size="large"
          class="form-input"
        />
      </el-form-item>

      <!-- Mobile -->
      <el-form-item label="Mobile" prop="Mobile">
        <el-input
          v-model="form.Mobile"
          placeholder="Enter mobile number"
          size="large"
          class="form-input"
        />
      </el-form-item>

      <!-- Telegram -->
      <el-form-item label="Telegram" prop="Telegram">
        <el-input
          v-model="form.Telegram"
          placeholder="Enter Telegram username"
          size="large"
          class="form-input"
        />
      </el-form-item>
    </el-form>

    <!-- Actions -->
    <template #footer>
      <div class="drawer-footer">
        <el-button @click="closeDrawer" size="large">
          Cancel
        </el-button>
        <el-button 
          type="primary" 
          @click="saveCustomer"
          :loading="saving"
          size="large"
          class="save-btn"
        >
          {{ isEditing ? 'Update Customer' : 'Add Customer' }}
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script>
export default {
  name: 'CustomerDrawer',
  data() {
    return {
      visible: false,
      saving: false,
      isEditing: false,
      form: {
        CustomerId: null,
        Name: '',
        Email: '',
        Mobile: '',
        Telegram: ''
      },
      rules: {
        Name: [
          { required: true, message: 'Customer name is required', trigger: 'blur' },
          { min: 2, max: 100, message: 'Name must be between 2 and 100 characters', trigger: 'blur' }
        ],
        Email: [
          { required: true, message: 'Email is required', trigger: 'blur' },
          { type: 'email', message: 'Please enter a valid email address', trigger: 'blur' }
        ],
        Mobile: [
          { required: true, message: 'Mobile number is required', trigger: 'blur' },
          { min: 10, max: 20, message: 'Mobile number must be between 10 and 20 characters', trigger: 'blur' }
        ],
        Telegram: [
          { min: 3, max: 50, message: 'Telegram username must be between 3 and 50 characters', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    open(customer = null) {
      this.isEditing = !!customer
      
      if (customer) {
        this.form = {
          CustomerId: customer.CustomerId,
          Name: customer.Name,
          Email: customer.Email,
          Mobile: customer.Mobile || customer.Phone || '', // Support both Mobile and Phone for backward compatibility
          Telegram: customer.Telegram || ''
        }
      } else {
        this.resetForm()
      }
      
      this.visible = true
    },

    closeDrawer() {
      this.visible = false
      this.resetForm()
    },

    resetForm() {
      this.form = {
        CustomerId: null,
        Name: '',
        Email: '',
        Mobile: '',
        Telegram: ''
      }
      this.isEditing = false
      
      // Clear form validation
      if (this.$refs.formRef) {
        this.$refs.formRef.clearValidate()
      }
    },

    async saveCustomer() {
      try {
        // Validate form
        await this.$refs.formRef.validate()
        
        this.saving = true
        
        if (this.isEditing) {
          await this.$command.Customer.update(this.form)
          this.$message.success('Customer updated successfully')
        } else {
          await this.$command.Customer.create(this.form)
          this.$message.success('Customer created successfully')
        }
        
        this.closeDrawer()
        this.$emit('customer-saved')
        
      } catch (error) {
        if (error !== false) { // false means validation failed
          console.error('Failed to save customer:', error)
          this.$message.error('Failed to save customer')
        }
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped>
.customer-drawer {
  --el-drawer-bg-color: #ffffff;
}

.customer-form {
  padding: 0 20px;
}

.form-input {
  width: 100%;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
}

.save-btn {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .customer-drawer {
    --el-drawer-size: 100%;
  }
  
  .customer-form {
    padding: 0 16px;
  }
  
  .drawer-footer {
    padding: 16px;
    flex-direction: column;
  }
  
  .drawer-footer .el-button {
    width: 100%;
  }
}
</style>