<template>
  <div class="dashboard-container">
    <!-- Header Section -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1>Dashboard</h1>
        <p>Manage your anonymous business operations</p>
      </div>
      <!-- Desktop Only Actions -->
      <div class="header-actions desktop-only">
        <ElButton type="primary" @click="openAddItem">
          <ElIcon><Plus /></ElIcon>
          Add Item
        </ElButton>
        <ElButton type="success" @click="openAddInventory">
          <ElIcon><Box /></ElIcon>
          Add Inventory
        </ElButton>
        <ElButton type="info" @click="openAddCustomer">
          <ElIcon><User /></ElIcon>
          Add Customer
        </ElButton>
        <ElButton type="primary" @click="openAddOrder">
          <ElIcon><ShoppingCart /></ElIcon>
          Add Order
        </ElButton>
        <ElButton type="warning" @click="resetDatabase" plain>
          <ElIcon><RefreshRight /></ElIcon>
          Reset Database
        </ElButton>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon items">
          <ElIcon><Box /></ElIcon>
        </div>
        <div class="stat-content">
          <h3>{{ stats.totalItems }}</h3>
          <p>Total Items</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon inventory">
          <ElIcon><List /></ElIcon>
        </div>
        <div class="stat-content">
          <h3>{{ stats.totalInventories }}</h3>
          <p>Inventories</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon customers">
          <ElIcon><User /></ElIcon>
        </div>
        <div class="stat-content">
          <h3>{{ stats.totalCustomers }}</h3>
          <p>Customers</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon orders">
          <ElIcon><ShoppingCart /></ElIcon>
        </div>
        <div class="stat-content">
          <h3>{{ stats.totalOrders }}</h3>
          <p>Orders</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon sales">
          <ElIcon><TrendCharts /></ElIcon>
        </div>
        <div class="stat-content">
          <h3>{{ stats.totalSales }}</h3>
          <p>Sales</p>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h2>Quick Actions</h2>
      <div class="actions-grid">
        <div class="action-card" @click="openAddItem">
          <ElIcon><Plus /></ElIcon>
          <h3>Add New Item</h3>
          <p>Create a new product or service</p>
        </div>
        
        <div class="action-card" @click="openAddInventory">
          <ElIcon><Box /></ElIcon>
          <h3>Add Inventory</h3>
          <p>Track stock and costs</p>
        </div>
        
        <div class="action-card" @click="showAddCustomer = true">
          <ElIcon><User /></ElIcon>
          <h3>Add Customer</h3>
          <p>Manage customer information</p>
        </div>
        
        <div class="action-card" @click="openAddOrder">
          <ElIcon><ShoppingCart /></ElIcon>
          <h3>Add Order</h3>
          <p>Create a new customer order</p>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="recent-activity">
      <div class="activity-header">
        <h2>Recent Activity</h2>
        <ElButton size="small" @click="loadRecentActivity" :loading="loadingActivity">
          <ElIcon><RefreshRight /></ElIcon>
          Refresh
        </ElButton>
      </div>
      <div class="activity-list">
        <div v-if="recentActivity.length === 0" class="no-activity">
          <ElIcon><Document /></ElIcon>
          <h3>No Activity Yet</h3>
          <p>Start by creating items and inventory to see your activity here</p>
          <ElButton @click="openAddItem" type="primary" size="small">
            <ElIcon><Plus /></ElIcon>
            Create First Item
          </ElButton>
        </div>
        <div v-else>
          <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
            <div class="activity-icon" :class="`activity-${activity.type}`">
              <ElIcon><component :is="activity.icon" /></ElIcon>
            </div>
            <div class="activity-content">
              <h4>{{ activity.title }}</h4>
              <p>{{ activity.description }}</p>
              <span class="activity-time">{{ formatTime(activity.time) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Drawers -->
    <ItemDrawer v-model:isCreateItem="showAddItem" @onCreate="refreshData" />
    <InventoryDrawer v-model:isCreateInventory="showAddInventory" @onCreate="refreshData" />
    <CustomerDrawer v-model="showAddCustomer" @customer-created="refreshData" @customer-updated="refreshData" />
    <OrderDrawer v-model="showAddOrder" @order-saved="refreshData" />
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Box, List, User, TrendCharts, DataAnalysis, Document, RefreshRight, ShoppingCart } from '@element-plus/icons-vue'
import ItemDrawer from "@/components/Item/ItemDrawer.vue"
import InventoryDrawer from "@/components/Inventory/InventoryDrawer.vue"
import CustomerDrawer from "@/components/Customer/CustomerDrawer.vue"
import OrderDrawer from "@/components/Order/OrderDrawer.vue"

export default {
  name: "DashboardComponent",
  components: { 
    ItemDrawer, 
    InventoryDrawer,
    CustomerDrawer,
    OrderDrawer,
    Plus, Box, List, User, TrendCharts, DataAnalysis, Document, ShoppingCart
  },
  data() {
    return {
      showAddItem: false,
      showAddInventory: false,
      showAddCustomer: false,
      showAddOrder: false,
      showReports: false,
      stats: reactive({
        totalItems: 0,
        totalInventories: 0,
        totalCustomers: 0,
        totalOrders: 0,
        totalSales: 0
      }),
      recentActivity: [],
      loadingActivity: false
    }
  },
  async mounted() {
    await this.loadDashboardData()
    await this.initializeP2P()
  },
  methods: {
    async loadDashboardData() {
      try {
        await Promise.all([
          this.loadStats(),
          this.loadRecentActivity()
        ])
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        ElMessage.error('Failed to load dashboard data')
      }
    },

    async initializeP2P() {
      try {
        // Check if commands are available
        if (!this.$command) {
          return
        }

        // Temporarily disable P2P initialization to prevent errors
        return

        // Import P2P initializer dynamically to avoid circular dependencies
        const { P2PInitializer } = await import('@/p2p/application/services/P2PInitializer')
        
        // Get configuration and settings
        const configuration = await this.$command.Configuration.getOne()
        const settings = await this.$command.Settings.getOne()
        
        // Initialize P2P with configuration
        const p2pInitializer = P2PInitializer.getInstance()
        await p2pInitializer.initialize(configuration, settings)
        
      } catch (error) {
        console.error('Failed to initialize P2P system:', error)
        // Don't show error message to user as P2P is optional
      }
    },
    
    async loadStats() {
      try {
        // Check if commands are available
        if (!this.$command) {
          return
        }

        const items = await this.$command.Item.getAll()
        const inventories = await this.$command.Inventory.getAll()
        const customers = await this.$command.Customer.getAll()
        const orders = await this.$command.Order.getAll()
        const sales = await this.$command.InventorySale.getAll()
        
        this.stats.totalItems = items?.length || 0
        this.stats.totalInventories = inventories?.length || 0
        this.stats.totalCustomers = customers?.length || 0
        this.stats.totalOrders = orders?.length || 0
        this.stats.totalSales = sales?.length || 0
        
      } catch (error) {
        console.error('Dashboard: Error loading stats:', error)
      }
    },
    
    async loadRecentActivity() {
      this.loadingActivity = true
      try {
        // Check if commands are available
        if (!this.$command) {
          this.loadingActivity = false
          return
        }

        const items = await this.$command.Item.getAll('desc')
        const inventories = await this.$command.Inventory.getAll('desc')
        const sales = await this.$command.InventorySale.getAll('desc')
        const customers = await this.$command.Customer.getAll('desc')
        const orders = await this.$command.Order.getAll('desc')
        
        const activities = []
        
        // Get recent items (last 3)
        if (items && items.length > 0) {
          const recentItems = items.slice(0, 3)
          recentItems.forEach(item => {
            activities.push({
              id: `item-${item.ItemId}`,
              title: 'New Item Added',
              description: `Created "${item.Name}"`,
              icon: 'Box',
              time: new Date(item.CreatedOn),
              type: 'item'
            })
          })
        }
        
        // Get recent inventories (last 3)
        if (inventories && inventories.length > 0) {
          const recentInventories = inventories.slice(0, 3)
          recentInventories.forEach(inventory => {
            activities.push({
              id: `inventory-${inventory.InventoryId}`,
              title: 'Inventory Created',
              description: `Added inventory for "${inventory.Name}"`,
              icon: 'List',
              time: new Date(inventory.CreatedOn),
              type: 'inventory'
            })
          })
        }
        
        // Get recent sales (last 3)
        if (sales && sales.length > 0) {
          const recentSales = sales.slice(0, 3)
          recentSales.forEach(sale => {
            activities.push({
              id: `sale-${sale.InventorySaleId}`,
              title: 'Sale Recorded',
              description: `Sold ${sale.Amount} units`,
              icon: 'TrendCharts',
              time: new Date(sale.CreatedOn),
              type: 'sale'
            })
          })
        }
        
        // Get recent customers (last 3)
        if (customers && customers.length > 0) {
          const recentCustomers = customers.slice(0, 3)
          recentCustomers.forEach(customer => {
            activities.push({
              id: `customer-${customer.CustomerId}`,
              title: 'New Customer Added',
              description: `Created "${customer.Name}"`,
              icon: 'User',
              time: new Date(customer.CreatedOn),
              type: 'customer'
            })
          })
        }
        
        // Get recent orders (last 3)
        if (orders && orders.length > 0) {
          const recentOrders = orders.slice(0, 3)
          recentOrders.forEach(order => {
            activities.push({
              id: `order-${order.OrderId}`,
              title: 'New Order Created',
              description: `Order #${order.OrderId} - ${order.Quantity} units`,
              icon: 'ShoppingCart',
              time: new Date(order.CreatedOn),
              type: 'order'
            })
          })
        }
        
        // Sort by time (most recent first) and take only the 5 most recent
        this.recentActivity = activities
          .sort((a, b) => b.time - a.time)
          .slice(0, 5)
          
      } catch (error) {
        console.error('Error loading recent activity:', error)
        this.recentActivity = []
      } finally {
        this.loadingActivity = false
      }
    },
    
    async refreshData() {
      await this.loadDashboardData()
    },
    
    formatTime(date) {
      const now = new Date()
      const diff = now - date
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)
      
      if (minutes < 60) {
        return `${minutes}m ago`
      } else if (hours < 24) {
        return `${hours}h ago`
      } else {
        return `${days}d ago`
      }
    },
    
    openAddItem() {
      this.showAddItem = true
    },
    
    openAddInventory() {
      this.showAddInventory = true
    },
    
    openAddCustomer() {
      this.showAddCustomer = true
    },
    
    openAddOrder() {
      this.showAddOrder = true
    },
    
    async resetDatabase() {
      try {
        await this.$confirm('This will delete all data and reset the database. Are you sure?', 'Reset Database', {
          confirmButtonText: 'Yes, Reset',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
        
        // Call the global reset function
        if (window.resetAnonDatabase) {
          await window.resetAnonDatabase()
          this.$message.success('Database reset successfully! Refreshing page...')
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        } else {
          this.$message.error('Reset function not available')
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('Failed to reset database')
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/assets/scss/components/dashboard/_dashboard-component.scss';
</style>
