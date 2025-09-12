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

<style lang="scss" scoped>
@import 'src/assets/scss/pages/_customers.scss';
</style>
