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
          <ElIcon><Refresh /></ElIcon>
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
          <ElIcon><Refresh /></ElIcon>
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

    <!-- Components -->
    <InventoriesList ref="inventoriesList" />
    <ItemsList ref="itemsList" />
    <CustomersList ref="customersList" />
    
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
import { Plus, Box, List, User, TrendCharts, DataAnalysis, Document, Refresh, ShoppingCart } from '@element-plus/icons-vue'
import InventoriesList from "@/components/Inventory/InventoriesList.vue"
import ItemsList from "@/components/Item/ItemsList.vue"
import CustomersList from "@/components/Customer/CustomersList.vue"
import ItemDrawer from "@/components/Item/ItemDrawer.vue"
import InventoryDrawer from "@/components/Inventory/InventoryDrawer.vue"
import CustomerDrawer from "@/components/Customer/CustomerDrawer.vue"
import OrderDrawer from "@/components/Order/OrderDrawer.vue"

export default {
  name: "DashboardComponent",
  components: { 
    ItemsList, 
    InventoriesList,
    CustomersList,
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
      // Refresh child components
      if (this.$refs.itemsList) {
        this.$refs.itemsList.loadItems()
      }
      if (this.$refs.inventoriesList) {
        this.$refs.inventoriesList.getInventories()
      }
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

<style scoped>
.dashboard-container {
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f8fafc;
  min-height: calc(100vh - 120px);
}

/* Mobile optimizations */
@media (max-width: 480px) {
  .dashboard-container {
    padding: 12px;
  }
  
  .dashboard-header {
    padding: 16px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
  
  .stat-content h3 {
    font-size: 24px;
  }
  
  .recent-activity {
    padding: 16px;
  }
  
  .activity-item {
    padding: 12px 0;
  }
  
  .activity-icon {
    width: 36px;
    height: 36px;
  }
}

.dashboard-header {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.header-content h1 {
  margin: 0 0 8px 0;
  color: #1e293b;
  font-size: 28px;
  font-weight: 600;
}

.header-content p {
  margin: 0;
  color: #64748b;
  font-size: 16px;
}

.header-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  width: 100%;
}

.header-actions .el-button {
  width: 100%;
  justify-content: center;
  font-size: 14px;
  padding: 12px 16px;
}

.header-actions .el-button .el-icon {
  margin-right: 6px;
}

/* Hide header actions on mobile */
.desktop-only {
  display: none;
}

/* Desktop layout */
@media (min-width: 768px) {
  .dashboard-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 0;
  }
  
  .header-content h1 {
    font-size: 32px;
  }
  
  .desktop-only {
    display: flex;
  }
  
  .header-actions {
    display: flex;
    grid-template-columns: none;
    width: auto;
    flex-wrap: wrap;
  }
  
  .header-actions .el-button {
    width: auto;
    min-width: 120px;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 40px;
}

/* Mobile optimization */
@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.items { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon.inventory { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-icon.customers { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.stat-icon.orders { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
.stat-icon.sales { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

.stat-content h3 {
  margin: 0 0 4px 0;
  font-size: 28px;
  font-weight: 600;
  color: #1e293b;
}

.stat-content p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.quick-actions {
  margin-bottom: 40px;
}

.quick-actions h2 {
  margin: 0 0 20px 0;
  color: #1e293b;
  font-size: 24px;
  font-weight: 600;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

/* Mobile optimization for action cards */
@media (max-width: 480px) {
  .actions-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .action-card {
    padding: 20px;
  }
  
  .action-card .el-icon {
    font-size: 28px;
  }
  
  .action-card h3 {
    font-size: 15px;
  }
  
  .action-card p {
    font-size: 13px;
  }
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #3b82f6;
}

.action-card .el-icon {
  font-size: 32px;
  color: #3b82f6;
  margin-bottom: 12px;
}

.action-card h3 {
  margin: 0 0 8px 0;
  color: #1e293b;
  font-size: 16px;
  font-weight: 600;
}

.action-card p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.recent-activity {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.activity-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 600;
}

.no-activity {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

.no-activity .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: var(--text-tertiary);
}

.no-activity h3 {
  margin: 0 0 8px 0;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
}

.no-activity p {
  margin: 0 0 20px 0;
  font-size: 14px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
}

.activity-item .activity-icon {
  background: #f8f9fa;
  color: #667eea;
}

.activity-item .activity-icon.activity-item {
  background: #e8f4fd;
  color: #1890ff;
}

.activity-item .activity-icon.activity-inventory {
  background: #f6ffed;
  color: #52c41a;
}

.activity-item .activity-icon.activity-sale {
  background: #fff7e6;
  color: #fa8c16;
}

.activity-content h4 {
  margin: 0 0 4px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.activity-content p {
  margin: 0 0 4px 0;
  color: #7f8c8d;
  font-size: 14px;
}

.activity-time {
  color: #bdc3c7;
  font-size: 12px;
}

/* Dark mode styles */
.dark .dashboard-container {
  background-color: #0f172a;
}

.dark .dashboard-header {
  background: #1e293b;
  border-color: #334155;
}

.dark .header-content h1 {
  color: #f8fafc;
}

.dark .header-content p {
  color: #cbd5e1;
}

.dark .stat-card {
  background: #1e293b;
  border-color: #334155;
}

.dark .stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.dark .stat-content h3 {
  color: #f8fafc;
}

.dark .stat-content p {
  color: #cbd5e1;
}

.dark .quick-actions h2 {
  color: #f8fafc;
}

.dark .action-card {
  background: #1e293b;
  border-color: #334155;
}

.dark .action-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  border-color: #60a5fa;
}

.dark .action-card .el-icon {
  color: #60a5fa;
}

.dark .action-card h3 {
  color: #f8fafc;
}

.dark .action-card p {
  color: #cbd5e1;
}

.dark .recent-activity {
  background: #1e293b;
  border-color: #334155;
}

.dark .activity-header h2 {
  color: #f8fafc;
}

.dark .activity-item {
  border-color: #334155;
}

.dark .activity-item:hover {
  background-color: #334155;
}

.dark .activity-icon {
  background-color: #334155;
}

.dark .activity-content h4 {
  color: #f8fafc;
}

.dark .activity-content p {
  color: #cbd5e1;
}

.dark .activity-time {
  color: #94a3b8;
}

.dark .no-activity {
  color: #cbd5e1;
}

.dark .no-activity .el-icon {
  color: #94a3b8;
}

.dark .no-activity h3 {
  color: #f8fafc;
}

.dark .no-activity p {
  color: #cbd5e1;
}
</style>
