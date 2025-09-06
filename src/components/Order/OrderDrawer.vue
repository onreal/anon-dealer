<template>
  <el-drawer
    v-model="visible"
    :title="isEditing ? 'Edit Order' : 'Add New Order'"
    direction="rtl"
    :size="isMobile ? '100%' : '50%'"
    @close="closeDrawer"
  >
    <el-form
      ref="orderFormRef"
      :model="orderForm"
      :rules="orderRules"
      label-width="120px"
      class="order-form"
    >
      <!-- Customer Selection -->
      <el-form-item label="Customer" prop="customerId" required>
        <el-select
          v-model="orderForm.customerId"
          placeholder="Select a customer"
          filterable
          style="width: 100%"
          @change="onCustomerChange"
        >
          <el-option
            v-for="customer in customers"
            :key="customer.CustomerId"
            :label="customer.Name"
            :value="customer.CustomerId"
          />
        </el-select>
      </el-form-item>

      <!-- Inventory Selection -->
      <el-form-item label="Inventory Item" prop="inventoryId" required>
        <el-select
          v-model="orderForm.inventoryId"
          placeholder="Select inventory item"
          filterable
          style="width: 100%"
          @change="onInventoryChange"
        >
          <el-option
            v-for="inventory in inventories"
            :key="inventory.InventoryId"
            :label="`${inventory.Name} (${inventory.Amount} units)`"
            :value="inventory.InventoryId"
          />
        </el-select>
      </el-form-item>

      <!-- Cost -->
      <el-form-item label="Cost" prop="cost" required>
        <el-input-number
          v-model="orderForm.cost"
          :min="0"
          :precision="2"
          placeholder="Enter cost"
          style="width: 100%"
        />
        <div v-if="selectedInventory" class="cost-info">
          Calculated: ${{ formatCurrency(selectedInventory.CostPerAmount) }} × {{ selectedInventory.Multiplier || 1 }} = ${{ formatCurrency((parseFloat(selectedInventory.CostPerAmount) || 0) * (parseFloat(selectedInventory.Multiplier) || 1)) }}
        </div>
      </el-form-item>

      <!-- Quantity -->
      <el-form-item label="Quantity" prop="quantity" required>
        <el-input-number
          v-model="orderForm.quantity"
          :min="maxQuantity > 0 ? 1 : 0"
          :max="maxQuantity > 0 ? maxQuantity : 999999"
          placeholder="Enter quantity"
          style="width: 100%"
        />
        <div v-if="maxQuantity > 0" class="quantity-info">
          Available: {{ maxQuantity }} units
        </div>
        <div v-else class="quantity-warning">
          No inventory available for this item
        </div>
        <div v-if="selectedInventory" class="quantity-suggestion">
          Suggested quantity: {{ selectedInventory.AmountForCost || 1 }} units (from inventory)
        </div>
      </el-form-item>

      <!-- Payment Status -->
      <el-form-item label="Payment Status" prop="isPaid">
        <el-switch
          v-model="orderForm.isPaid"
          active-text="Paid"
          inactive-text="Unpaid"
        />
      </el-form-item>

      <!-- Notes -->
      <el-form-item label="Notes" prop="notes">
        <el-input
          v-model="orderForm.notes"
          type="textarea"
          :rows="3"
          placeholder="Additional notes (optional)"
        />
      </el-form-item>

      <!-- Form Actions -->
      <el-form-item class="form-actions">
        <el-button @click="closeDrawer">Cancel</el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="submit"
        >
          {{ isEditing ? 'Update Order' : 'Create Order' }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script>
export default {
  name: 'OrderDrawer',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    order: {
      type: Object,
      default: null
    }
  },
  emits: ['update:modelValue', 'order-saved'],
  data() {
    return {
      orderForm: {
        customerId: null,
        inventoryId: null,
        cost: null,
        quantity: 1,
        isPaid: false,
        notes: ''
      },
      customers: [],
      inventories: [],
      maxQuantity: 0,
      loading: false,
      error: null,
      isMobile: false,
      orderRules: {
        customerId: [
          { required: true, message: 'Please select a customer', trigger: 'change' }
        ],
        inventoryId: [
          { required: true, message: 'Please select an inventory item', trigger: 'change' }
        ],
        cost: [
          { required: true, message: 'Please enter the cost', trigger: 'blur' },
          { type: 'number', min: 0, message: 'Cost must be greater than or equal to 0', trigger: 'blur' }
        ],
        quantity: [
          { required: true, message: 'Please enter the quantity', trigger: 'blur' },
          { 
            validator: (rule, value, callback) => {
              if (value < 1) {
                callback(new Error('Quantity must be at least 1'))
              } else if (this.maxQuantity > 0 && value > this.maxQuantity) {
                callback(new Error(`Quantity cannot exceed available inventory (${this.maxQuantity})`))
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ]
      }
    }
  },
  computed: {
    visible: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    },
    isEditing() {
      return this.order && this.order.OrderId
    },
    selectedInventory() {
      if (!this.orderForm.inventoryId) return null
      return this.inventories.find(inv => inv.InventoryId === this.orderForm.inventoryId)
    }
  },
  mounted() {
    this.checkScreenSize()
    window.addEventListener('resize', this.checkScreenSize)
  },
  unmounted() {
    window.removeEventListener('resize', this.checkScreenSize)
  },
  watch: {
    modelValue(newVal) {
      if (newVal) {
        this.loadData()
        if (this.isEditing) {
          this.populateForm()
        } else {
          this.resetForm()
        }
      }
    }
  },
  
  watch: {
    visible(newVisible) {
      if (newVisible) {
        // Check if dark mode is enabled
        const isDarkMode = document.documentElement.classList.contains('dark')
        if (isDarkMode) {
          // Force dark mode styles on drawer elements
          setTimeout(() => {
            try {
              const drawer = document.querySelector('.el-drawer')
              const header = document.querySelector('.el-drawer__header')
              const body = document.querySelector('.el-drawer__body')
              const footer = document.querySelector('.el-drawer__footer')
              const title = document.querySelector('.el-drawer__title')
              const closeBtn = document.querySelector('.el-drawer__close-btn')
              
              if (drawer && drawer.parentNode) {
                drawer.style.backgroundColor = '#1e293b'
                drawer.style.color = '#f8fafc'
              }
              if (header && header.parentNode) {
                header.style.backgroundColor = '#1e293b'
                header.style.color = '#f8fafc'
                header.style.borderBottomColor = '#334155'
              }
              if (body && body.parentNode) {
                body.style.backgroundColor = '#1e293b'
                body.style.color = '#f8fafc'
              }
              if (footer && footer.parentNode) {
                footer.style.backgroundColor = '#1e293b'
                footer.style.color = '#f8fafc'
                footer.style.borderTopColor = '#334155'
              }
              if (title && title.parentNode) {
                title.style.color = '#f8fafc'
              }
              if (closeBtn && closeBtn.parentNode) {
                closeBtn.style.color = '#f8fafc'
              }
            } catch (error) {
              console.warn('Error applying dark mode to drawer:', error)
            }
          }, 200)
        }
      }
    }
  },
  
  methods: {
    checkScreenSize() {
      this.isMobile = window.innerWidth <= 768
    },
    async loadData() {
      try {
        // Load customers
        this.customers = await this.$command.Customer.getAll()
        
        // Load inventories
        this.inventories = await this.$command.Inventory.getAll()
      } catch (error) {
        console.error('Error loading data:', error)
        this.$message.error('Failed to load data')
      }
    },

    populateForm() {
      if (this.order) {
        this.orderForm = {
          customerId: this.order.CustomerId,
          inventoryId: this.order.InventoryId,
          cost: this.order.Cost,
          quantity: this.order.Quantity,
          isPaid: this.order.IsPaid,
          notes: this.order.Notes || ''
        }
        this.updateMaxQuantity()
      }
    },

    resetForm() {
      this.orderForm = {
        customerId: null,
        inventoryId: null,
        cost: null,
        quantity: 1, // Number for encryption
        isPaid: false,
        notes: ''
      }
      this.maxQuantity = 0
    },

    async onInventoryChange() {
      await this.updateMaxQuantity()
      
      // Auto-populate cost and quantity from selected inventory
      if (this.selectedInventory) {
        // Calculate cost: CostPerAmount * Multiplier
        const sellingPrice = parseFloat(this.selectedInventory.CostPerAmount) || 0
        const multiplier = parseFloat(this.selectedInventory.Multiplier) || 1
        this.orderForm.cost = sellingPrice * multiplier // Keep as number for encryption
        
        // Set quantity to units for cost
        this.orderForm.quantity = Number(this.selectedInventory.AmountForCost) || 1 // Ensure number for encryption
        
        // Ensure quantity doesn't exceed available amount
        if (this.orderForm.quantity > this.maxQuantity) {
          this.orderForm.quantity = this.maxQuantity
        }
      } else {
        // Reset if no inventory selected
        this.orderForm.cost = null
        this.orderForm.quantity = 1 // Number for encryption
      }
    },

    async updateMaxQuantity() {
      if (this.orderForm.inventoryId) {
        const selectedInventory = this.inventories.find(
          inv => inv.InventoryId === this.orderForm.inventoryId
        )
        
        if (selectedInventory) {
          // Handle both encrypted and decrypted Amount values
          if (typeof selectedInventory.Amount === 'string' && selectedInventory.Amount.includes('U2FsdGVkX1')) {
            // This is an encrypted string, get fresh data
            const freshInventory = await this.$command.Inventory.get(selectedInventory.InventoryId)
            this.maxQuantity = Number(freshInventory?.Amount) || 0
          } else {
            this.maxQuantity = Number(selectedInventory.Amount) || 0
          }
        } else {
          this.maxQuantity = 0
        }
      } else {
        this.maxQuantity = 0
      }
    },

    async submit() {
      if (!this.$refs.orderFormRef) return

      try {
        await this.$refs.orderFormRef.validate()
        this.loading = true
        this.error = null

        // Validate required fields
        if (!this.orderForm.customerId) {
          throw new Error('Please select a customer')
        }
        if (!this.orderForm.inventoryId) {
          throw new Error('Please select an inventory')
        }

        // Get the selected inventory to extract ItemId
        const selectedInventory = this.inventories.find(inv => inv.InventoryId === this.orderForm.inventoryId)
        if (!selectedInventory) {
          throw new Error('Selected inventory not found')
        }

        // Validate inventory quantity for new orders
        if (!this.isEditing) {
          // Handle both encrypted and decrypted Amount values
          let availableQuantity = 0
          if (typeof selectedInventory.Amount === 'string' && selectedInventory.Amount.includes('U2FsdGVkX1')) {
            // This is an encrypted string, we need to get fresh data
            console.warn('OrderDrawer: Amount appears to be encrypted, fetching fresh inventory data')
            const freshInventory = await this.$command.Inventory.get(selectedInventory.InventoryId)
            availableQuantity = Number(freshInventory?.Amount) || 0
          } else {
            availableQuantity = Number(selectedInventory.Amount) || 0
          }
          
          const requestedQuantity = Number(this.orderForm.quantity) || 0
          
          console.log('OrderDrawer validation:', {
            inventoryId: selectedInventory.InventoryId,
            availableQuantity,
            requestedQuantity,
            amountField: selectedInventory.Amount
          })
          
          if (requestedQuantity > availableQuantity) {
            throw new Error(`Insufficient inventory. Available: ${availableQuantity}, Requested: ${requestedQuantity}`)
          }
        }

        const orderData = {
          CustomerId: this.orderForm.customerId,
          InventoryId: this.orderForm.inventoryId,
          InventoryItemId: selectedInventory.ItemId, // Add the ItemId from inventory
          Cost: Number(this.orderForm.cost) || 0, // Ensure number for encryption
          Quantity: Number(this.orderForm.quantity) || 1, // Ensure number for encryption
          IsPaid: this.orderForm.isPaid,
          Notes: this.orderForm.notes || '',
          CreatedOn: new Date(),
          ModifiedOn: new Date()
        }

        if (this.isEditing) {
          orderData.OrderId = this.order.OrderId
          await this.$command.Order.update(orderData)
          this.$message.success('Order updated successfully')
        } else {
          // Create new order
          await this.$command.Order.add(orderData)
          
          // Reduce inventory quantity
          await this.$command.Inventory.reduceQuantity(
            this.orderForm.inventoryId, 
            Number(this.orderForm.quantity)
          )
          
          this.$message.success('Order created successfully and inventory updated')
        }

        this.$emit('order-saved')
        this.closeDrawer()
      } catch (error) {
        console.error('Error saving order:', error)
        this.error = error.message || 'Failed to save order'
        this.$message.error(this.error)
      } finally {
        this.loading = false
      }
    },

    closeDrawer() {
      this.visible = false
      this.resetForm()
    },

    formatCurrency(value) {
      if (!value) return '0.00'
      const num = parseFloat(value)
      return isNaN(num) ? '0.00' : num.toFixed(2)
    }
  }
}
</script>

<style scoped>
/* Force dark mode on drawer - highest specificity */
:deep(.el-drawer) {
  background-color: #1e293b !important;
  color: #f8fafc !important;
}

:deep(.el-drawer__header) {
  background-color: #1e293b !important;
  color: #f8fafc !important;
  border-bottom-color: #334155 !important;
}

:deep(.el-drawer__body) {
  background-color: #1e293b !important;
  color: #f8fafc !important;
}

:deep(.el-drawer__footer) {
  background-color: #1e293b !important;
  color: #f8fafc !important;
  border-top-color: #334155 !important;
}

:deep(.el-drawer__title) {
  color: #f8fafc !important;
}

:deep(.el-drawer__close-btn) {
  color: #f8fafc !important;
}
.order-form {
  padding: 20px;
}

.form-actions {
  margin-top: 30px;
  text-align: right;
}

.form-actions .el-button {
  margin-left: 10px;
}

.quantity-info {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.quantity-warning {
  font-size: 12px;
  color: #f56c6c;
  margin-top: 5px;
}

.cost-info {
  font-size: 12px;
  color: #67c23a;
  margin-top: 5px;
}

.quantity-suggestion {
  font-size: 12px;
  color: #67c23a;
  margin-top: 5px;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-input-number {
  width: 100%;
}

.el-select {
  width: 100%;
}

/* Dark Mode Styles */
html.dark :deep(.el-drawer) {
  background-color: #1e293b !important;
  color: #f8fafc !important;
}

html.dark :deep(.el-drawer__header) {
  background-color: #1e293b !important;
  border-bottom-color: #334155 !important;
  color: #f8fafc !important;
}

html.dark :deep(.el-drawer__body) {
  background-color: #1e293b !important;
  color: #f8fafc !important;
}

html.dark :deep(.el-drawer__footer) {
  background-color: #1e293b !important;
  border-top-color: #334155 !important;
  color: #f8fafc !important;
}

html.dark :deep(.el-drawer__title) {
  color: #f8fafc !important;
}

html.dark :deep(.el-drawer__close-btn) {
  color: #f8fafc !important;
}

.dark .quantity-info {
  color: #cbd5e1;
}

.dark .quantity-warning {
  color: #f87171;
}

.dark .cost-info {
  color: #34d399;
}

.dark .quantity-suggestion {
  color: #34d399;
}
</style>
