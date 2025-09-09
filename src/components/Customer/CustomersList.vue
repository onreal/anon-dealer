<template>
  <div class="customers-container">
    <!-- Header -->
    <div class="customers-header">
      <div class="header-content">
        <h2 class="customers-title">
          <el-icon class="title-icon"><User /></el-icon>
          Customers
        </h2>
        <el-button 
          type="primary" 
          @click="openCustomerDrawer"
          class="add-customer-btn"
        >
          <el-icon><Plus /></el-icon>
          Add Customer
        </el-button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- Empty State -->
    <div v-else-if="customers.length === 0" class="empty-state">
      <div class="empty-icon">
        <el-icon><UserFilled /></el-icon>
      </div>
      <h3>No customers yet</h3>
      <p>Start by adding your first customer to manage your business relationships.</p>
      <el-button type="primary" @click="openCustomerDrawer">
        <el-icon><Plus /></el-icon>
        Add First Customer
      </el-button>
    </div>

    <!-- Customers Grid -->
    <div v-else class="customers-grid">
      <div 
        v-for="customer in customers" 
        :key="customer.CustomerId"
        class="customer-card"
      >
        <!-- Customer Info -->
        <div class="customer-info">
          <div class="customer-avatar">
            <el-icon><User /></el-icon>
          </div>
          <div class="customer-details">
            <h3 class="customer-name">{{ customer.Name }}</h3>
            <p class="customer-email">{{ customer.Email }}</p>
            <p class="customer-phone">{{ customer.Phone }}</p>
          </div>
        </div>

        <!-- Customer Stats -->
        <div class="customer-stats">
          <div class="stat-item">
            <span class="stat-label">Orders</span>
            <span class="stat-value">{{ getCustomerOrderCount(customer.CustomerId) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Spent</span>
            <span class="stat-value">${{ formatCurrency(getCustomerTotalSpent(customer.CustomerId)) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Amount Owed</span>
            <span class="stat-value">${{ formatCurrency(getCustomerAmountOwed(customer.CustomerId)) }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="customer-actions">
          <el-tooltip content="Edit Customer" placement="top">
            <el-button 
              :icon="Edit" 
              size="small"
              @click="editCustomer(customer)"
              class="action-btn edit-btn"
              plain
            >
              <el-icon><Edit /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="Delete Customer" placement="top">
            <el-button 
              :icon="Delete" 
              size="small"
              @click="deleteCustomer(customer)"
              class="action-btn delete-btn"
              plain
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </div>

    <!-- Customer Drawer -->
    <CustomerDrawer 
      ref="customerDrawer"
      @customer-saved="handleCustomerSaved"
    />
  </div>
</template>

<script>
import CustomerDrawer from "./CustomerDrawer.vue"
import { User, Plus, UserFilled, Edit, Delete } from '@element-plus/icons-vue'

export default {
  name: 'CustomersList',
  components: {
    CustomerDrawer,
    User,
    Plus,
    UserFilled,
    Edit,
    Delete
  },
  data() {
    return {
      customers: [],
      orders: [],
      loading: false
    }
  },
  async mounted() {
    await this.loadCustomers()
    await this.loadOrders()
  },
  methods: {
    async loadCustomers() {
      try {
        this.loading = true
        this.customers = await this.$command.Customer.getAll()
      } catch (error) {
        console.error('Failed to load customers:', error)
        this.$message.error('Failed to load customers')
      } finally {
        this.loading = false
      }
    },

    async loadOrders() {
      try {
        this.orders = await this.$command.Order.getAll()
      } catch (error) {
        console.error('Failed to load orders:', error)
      }
    },

    openCustomerDrawer() {
      this.$refs.customerDrawer.open()
    },

    editCustomer(customer) {
      this.$refs.customerDrawer.open(customer)
    },

    async deleteCustomer(customer) {
      try {
        // Check if customer has orders
        const customerOrders = this.orders.filter(order => order.CustomerId === customer.CustomerId)
        
        let confirmMessage = `Are you sure you want to delete "${customer.Name}"?`
        let confirmTitle = 'Delete Customer'
        
        if (customerOrders.length > 0) {
          confirmMessage = `Are you sure you want to delete "${customer.Name}"? 

This customer has ${customerOrders.length} order(s). The customer will be marked as deleted but their order history will be preserved. You can restore them later if needed.`
          confirmTitle = 'Deactivate Customer'
        } else {
          confirmMessage += ' This action cannot be undone.'
        }

        await this.$confirm(
          confirmMessage,
          confirmTitle,
          {
            confirmButtonText: customerOrders.length > 0 ? 'Deactivate' : 'Delete',
            cancelButtonText: 'Cancel',
            type: 'warning',
            confirmButtonClass: 'el-button--danger'
          }
        )

        await this.$command.Customer.delete(customer.CustomerId)
        
        if (customerOrders.length > 0) {
          this.$message.success('Customer deactivated successfully. Order history preserved.')
        } else {
          this.$message.success('Customer deleted successfully')
        }
        await this.loadCustomers()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Failed to delete customer:', error)
          this.$message.error('Failed to delete customer')
        }
      }
    },

    async handleCustomerSaved() {
      await this.loadCustomers()
    },

    getCustomerOrderCount(customerId) {
      return this.orders.filter(order => order.CustomerId === customerId).length
    },

    getCustomerTotalSpent(customerId) {
      const customerOrders = this.orders.filter(order => 
        order.CustomerId === customerId && (order.IsPaid === true || order.IsPaid === 'true')
      )
      return customerOrders.reduce((total, order) => {
        return total + (Number(order.Cost) || 0)
      }, 0)
    },

    getCustomerAmountOwed(customerId) {
      const customerOrders = this.orders.filter(order => 
        order.CustomerId === customerId && (order.IsPaid === false || order.IsPaid === 'false' || order.IsPaid === null || order.IsPaid === undefined)
      )
      return customerOrders.reduce((total, order) => {
        return total + (Number(order.Cost) || 0)
      }, 0)
    },

    formatCurrency(amount) {
      return Number(amount).toFixed(2)
    }
  }
}
</script>

<style scoped>
.customers-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.customers-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.customers-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}

.title-icon {
  color: #3b82f6;
}

.add-customer-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.add-customer-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

.loading-container {
  padding: 20px 0;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 2px dashed var(--border-primary);
}

.empty-icon {
  font-size: 48px;
  color: var(--text-tertiary);
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: var(--text-primary);
  font-size: 20px;
}

.empty-state p {
  margin: 0 0 24px 0;
  color: var(--text-secondary);
  font-size: 16px;
}

.customers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.customer-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-primary);
  transition: all 0.3s ease;
  position: relative;
}

.customer-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.customer-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.customer-details {
  flex: 1;
}

.customer-name {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.customer-email,
.customer-phone {
  margin: 0 0 2px 0;
  font-size: 14px;
  color: #6b7280;
}

.customer-stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8fafc;
}

.dark .customer-stats {
  background: #1e293b;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.customer-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 6px;
  border: 1px solid transparent;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.action-btn .el-icon {
  font-size: 14px;
}

.edit-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-color: #f093fb;
  color: white;
}

.edit-btn:hover {
  background: linear-gradient(135deg, #e085f0 0%, #e54a5b 100%);
  border-color: #e085f0;
}

.delete-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  border-color: #ff6b6b;
  color: white;
}

.delete-btn:hover {
  background: linear-gradient(135deg, #ff5252 0%, #e53935 100%);
  border-color: #ff5252;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .customers-container {
    padding: 16px;
  }

  .customers-title {
    font-size: 20px;
  }

  .add-customer-btn {
    padding: 8px 12px;
    font-size: 14px;
  }

  .customers-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .customer-card {
    padding: 16px;
  }

  .customer-info {
    gap: 10px;
  }

  .customer-avatar {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .customer-name {
    font-size: 16px;
  }

  .customer-email,
  .customer-phone {
    font-size: 13px;
  }

  .customer-stats {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 10px;
  }

  .stat-value {
    font-size: 14px;
  }

  .customer-actions {
    gap: 6px;
  }
  
  .action-btn {
    width: 28px;
    height: 28px;
  }
  
  .action-btn .el-icon {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .customers-title {
    text-align: center;
  }

  .add-customer-btn {
    justify-content: center;
  }

  .customer-stats {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}
</style>