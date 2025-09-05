<template>
  <div class="customers-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>Customers</h1>
        <p>Manage your customer database</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="addCustomer">
          <el-icon><Plus /></el-icon>
          Add Customer
        </el-button>
      </div>
    </div>

    <!-- Search and Filter Section -->
    <div class="search-filter-section">
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="Search customers by name, email, mobile, or telegram..."
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      
      <div class="filter-controls">
        <el-select
          v-model="statusFilter"
          placeholder="Filter by status"
          clearable
          @change="handleFilter"
        >
          <el-option label="All Customers" value="" />
          <el-option label="Active Customers" value="active" />
          <el-option label="Deleted Customers" value="deleted" />
        </el-select>
        
        <el-select
          v-model="sortBy"
          placeholder="Sort by"
          @change="handleSort"
        >
          <el-option label="Name (A-Z)" value="name-asc" />
          <el-option label="Name (Z-A)" value="name-desc" />
          <el-option label="Most Orders" value="orders-desc" />
          <el-option label="Highest Spent" value="spent-desc" />
          <el-option label="Recently Added" value="created-desc" />
        </el-select>
      </div>
    </div>

    <!-- Stats Summary -->
    <div class="stats-summary">
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-content">
          <h3>{{ filteredCustomers.length }}</h3>
          <p>Total Customers</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><ShoppingCart /></el-icon>
        </div>
        <div class="stat-content">
          <h3>{{ totalOrders }}</h3>
          <p>Total Orders</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><Money /></el-icon>
        </div>
        <div class="stat-content">
          <h3>${{ formatCurrency(totalRevenue) }}</h3>
          <p>Total Revenue</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="stat-content">
          <h3>${{ formatCurrency(totalPending) }}</h3>
          <p>Pending Revenue</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="6" animated />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <el-alert
        :title="error"
        type="error"
        show-icon
        :closable="false"
      />
    </div>

    <!-- Customers List -->
    <div v-else-if="filteredCustomers.length === 0" class="empty-state">
      <el-icon><User /></el-icon>
      <h3>No customers found</h3>
      <p v-if="searchQuery || statusFilter">
        Try adjusting your search or filter criteria
      </p>
      <p v-else>
        Create your first customer to get started
      </p>
      <el-button type="primary" @click="addCustomer">
        <el-icon><Plus /></el-icon>
        Add Customer
      </el-button>
    </div>

    <div v-else class="customers-grid">
      <div 
        v-for="customer in paginatedCustomers" 
        :key="customer.CustomerId" 
        class="customer-card"
      >
        <div class="customer-header">
          <div class="customer-avatar">
            <img v-if="customer.Image" :src="customer.Image" :alt="customer.Name" />
            <div v-else class="avatar-placeholder">
              <el-icon><User /></el-icon>
            </div>
          </div>
          <div class="customer-info">
            <h3>{{ customer.Name }}</h3>
            <p v-if="customer.Email">{{ customer.Email }}</p>
            <p v-if="customer.Mobile || customer.Phone">{{ customer.Mobile || customer.Phone }}</p>
            <p v-if="customer.Telegram">@{{ customer.Telegram }}</p>
          </div>
          <div class="customer-status">
            <el-tag 
              :type="customer.Status === 'deleted' ? 'danger' : 'success'"
              size="small"
            >
              {{ customer.Status === 'deleted' ? 'Deleted' : 'Active' }}
            </el-tag>
          </div>
        </div>

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

    <!-- Pagination -->
    <div v-if="filteredCustomers.length > pageSize" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="filteredCustomers.length"
        layout="prev, pager, next, total"
        @current-change="handlePageChange"
      />
    </div>

    <!-- Customer Drawer -->
    <CustomerDrawer
      ref="customerDrawer"
      @close="closeCustomerDrawer"
      @saved="handleCustomerSaved"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Plus, 
  Search, 
  User, 
  ShoppingCart, 
  Money, 
  Clock,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import CustomerDrawer from '@/components/Customer/CustomerDrawer.vue'

export default {
  name: 'Customers',
  components: {
    CustomerDrawer,
    Plus,
    Search,
    User,
    ShoppingCart,
    Money,
    Clock,
    Edit,
    Delete
  },
  data() {
    return {
      loading: false,
      error: null,
      customers: [],
      orders: [],
      
      // Search and filter
      searchQuery: '',
      statusFilter: '',
      sortBy: 'name-asc',
      
      // Pagination
      currentPage: 1,
      pageSize: 12,
      
      // Customer drawer state is managed by the CustomerDrawer component
    }
  },
  computed: {
    filteredCustomers() {
      let filtered = [...this.customers]
      
      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(customer => 
          customer.Name?.toLowerCase().includes(query) ||
          customer.Email?.toLowerCase().includes(query) ||
          customer.Mobile?.toLowerCase().includes(query) ||
          customer.Phone?.toLowerCase().includes(query) ||
          customer.Telegram?.toLowerCase().includes(query)
        )
      }
      
      // Apply status filter
      if (this.statusFilter) {
        filtered = filtered.filter(customer => customer.Status === this.statusFilter)
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        switch (this.sortBy) {
          case 'name-asc':
            return (a.Name || '').localeCompare(b.Name || '')
          case 'name-desc':
            return (b.Name || '').localeCompare(a.Name || '')
          case 'orders-desc':
            return this.getCustomerOrderCount(b.CustomerId) - this.getCustomerOrderCount(a.CustomerId)
          case 'spent-desc':
            return this.getCustomerTotalSpent(b.CustomerId) - this.getCustomerTotalSpent(a.CustomerId)
          case 'created-desc':
            return new Date(b.CreatedOn) - new Date(a.CreatedOn)
          default:
            return 0
        }
      })
      
      return filtered
    },
    
    paginatedCustomers() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredCustomers.slice(start, end)
    },
    
    totalOrders() {
      return this.orders.length
    },
    
    totalRevenue() {
      return this.orders
        .filter(order => this.isOrderPaid(order.IsPaid))
        .reduce((total, order) => total + (Number(order.Cost) || 0), 0)
    },
    
    totalPending() {
      return this.orders
        .filter(order => !this.isOrderPaid(order.IsPaid))
        .reduce((total, order) => total + (Number(order.Cost) || 0), 0)
    }
  },
  async mounted() {
    await this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      this.error = null
      
      try {
        await Promise.all([
          this.loadCustomers(),
          this.loadOrders()
        ])
      } catch (error) {
        console.error('Error loading data:', error)
        this.error = 'Failed to load customer data'
      } finally {
        this.loading = false
      }
    },

    async loadCustomers() {
      try {
        this.customers = await this.$command.Customer.getAll()
      } catch (error) {
        console.error('Failed to load customers:', error)
        this.$message.error('Failed to load customers')
      }
    },

    async loadOrders() {
      try {
        this.orders = await this.$command.Order.getAll()
      } catch (error) {
        console.error('Failed to load orders:', error)
      }
    },

    handleSearch() {
      this.currentPage = 1 // Reset to first page when searching
    },

    handleFilter() {
      this.currentPage = 1 // Reset to first page when filtering
    },

    handleSort() {
      this.currentPage = 1 // Reset to first page when sorting
    },

    handlePageChange(page) {
      this.currentPage = page
    },

    getCustomerOrderCount(customerId) {
      return this.orders.filter(order => order.CustomerId === customerId).length
    },

    getCustomerTotalSpent(customerId) {
      const customerOrders = this.orders.filter(order => 
        order.CustomerId === customerId && this.isOrderPaid(order.IsPaid)
      )
      return customerOrders.reduce((total, order) => {
        return total + (Number(order.Cost) || 0)
      }, 0)
    },

    getCustomerAmountOwed(customerId) {
      const customerOrders = this.orders.filter(order => 
        order.CustomerId === customerId && !this.isOrderPaid(order.IsPaid)
      )
      return customerOrders.reduce((total, order) => {
        return total + (Number(order.Cost) || 0)
      }, 0)
    },

    isOrderPaid(isPaidValue) {
      return isPaidValue === true || isPaidValue === 'true'
    },

    formatCurrency(amount) {
      return Number(amount).toFixed(2)
    },

    addCustomer() {
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

    closeCustomerDrawer() {
      // CustomerDrawer handles its own state
    },

    async handleCustomerSaved() {
      await this.loadCustomers()
      this.closeCustomerDrawer()
    }
  }
}
</script>

<style scoped>
.customers-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

.header-content h1 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 2rem;
}

.header-content p {
  margin: 0;
  color: #6c757d;
  font-size: 1.1rem;
}

.search-filter-section {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  align-items: center;
}

.search-box {
  flex: 1;
  max-width: 400px;
}

.filter-controls {
  display: flex;
  gap: 12px;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.stat-content h3 {
  margin: 0 0 4px 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.stat-content p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.loading-container, .error-container {
  padding: 40px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-state .el-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  color: #d1d5db;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #374151;
}

.empty-state p {
  margin: 0 0 20px 0;
}

.customers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.customer-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.customer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.customer-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.customer-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.customer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.customer-info {
  flex: 1;
}

.customer-info h3 {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.customer-info p {
  margin: 0 0 2px 0;
  font-size: 0.9rem;
  color: #6c757d;
}

.customer-stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
}

.customer-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
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

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }
  
  .search-filter-section {
    flex-direction: column;
    gap: 12px;
  }
  
  .filter-controls {
    flex-direction: column;
  }
  
  .customers-grid {
    grid-template-columns: 1fr;
  }
  
  .customer-stats {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .customer-stats {
    grid-template-columns: 1fr;
  }
}
</style>
