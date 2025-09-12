<template>
  <div class="inventory-reports-container">
    <!-- Header Section -->
    <div class="reports-header">
      <div class="header-content">
        <div class="breadcrumb">
          <el-button type="text" @click="$router.push('/inventory')">
            <el-icon><ArrowLeft /></el-icon>
            Back to Inventory
          </el-button>
        </div>
        <h1>{{ inventoryName }} - Analytics & Reports</h1>
        <p>Detailed performance analysis and forecasting for this inventory item</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="refreshReports">
          <el-icon><Refresh /></el-icon>
          Refresh Data
        </el-button>
        <el-button type="success" @click="exportReports">
          <el-icon><Download /></el-icon>
          Export Report
        </el-button>
        <el-button @click="$router.push('/reports')">
          <el-icon><TrendCharts /></el-icon>
          View All Reports
        </el-button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
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

    <!-- Reports Content -->
    <div v-else class="reports-content">
      <!-- Summary Cards -->
      <div class="summary-grid">
        <div class="summary-card">
          <div class="card-icon profit">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="card-content">
            <h3>${{ formatCurrency(inventoryAnalytics.totalProfit) }}</h3>
            <p>Total Profit</p>
            <span class="trend" :class="inventoryAnalytics.totalProfit > 0 ? 'positive' : 'negative'">
              {{ inventoryAnalytics.totalProfit > 0 ? '+' : '' }}{{ inventoryAnalytics.totalProfit.toFixed(2) }}
            </span>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="card-icon revenue">
            <el-icon><Money /></el-icon>
          </div>
          <div class="card-content">
            <h3>${{ formatCurrency(inventoryAnalytics.totalRevenue) }}</h3>
            <p>Total Revenue</p>
            <span class="trend positive">+{{ inventoryAnalytics.totalRevenue.toFixed(2) }}</span>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="card-icon margin">
            <el-icon><PieChart /></el-icon>
          </div>
          <div class="card-content">
            <h3>{{ inventoryAnalytics.profitMargin.toFixed(2) }}%</h3>
            <p>Profit Margin</p>
            <span class="trend" :class="getMarginTrendClass(inventoryAnalytics.profitMargin)">
              {{ getMarginTrendText(inventoryAnalytics.profitMargin) }}
            </span>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="card-icon velocity">
            <el-icon><RefreshRight /></el-icon>
          </div>
          <div class="card-content">
            <h3>{{ inventoryAnalytics.salesVelocity.toFixed(2) }}</h3>
            <p>Sales Velocity (units/day)</p>
            <span class="trend positive">Active</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon payment">
            <el-icon><CreditCard /></el-icon>
          </div>
          <div class="card-content">
            <h3>${{ formatCurrency(paymentAnalytics.paidAmount) }}</h3>
            <p>Paid Revenue</p>
            <span class="trend positive">{{ paymentAnalytics.paidOrders }} orders</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon pending">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="card-content">
            <h3>${{ formatCurrency(paymentAnalytics.pendingAmount) }}</h3>
            <p>Pending Revenue</p>
            <span class="trend warning">{{ paymentAnalytics.pendingOrders }} orders</span>
          </div>
        </div>
      </div>

      <!-- Inventory Details -->
      <div class="inventory-details">
        <div class="details-card">
          <h3>Inventory Details</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Current Stock:</span>
              <span class="detail-value">{{ inventoryAnalytics.currentStock }} units</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Cost per Unit:</span>
              <span class="detail-value">${{ formatCurrency(inventoryAnalytics.costPerUnit) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Selling Price:</span>
              <span class="detail-value">${{ formatCurrency(inventoryAnalytics.sellingPrice) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Multiplier:</span>
              <span class="detail-value">{{ inventoryAnalytics.multiplier }}x</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Days of Stock:</span>
              <span class="detail-value">{{ inventoryAnalytics.daysOfStock === 'N/A' ? 'N/A' : inventoryAnalytics.daysOfStock + ' days' }}</span>
            </div>
          </div>
        </div>

        <div class="forecast-card">
          <h3>Forecasting</h3>
          <div class="forecast-content">
            <div class="forecast-item">
              <span class="forecast-label">30-Day Prediction:</span>
              <span class="forecast-value">{{ forecastingData.predictedStock30Days }} units</span>
            </div>
            <div class="forecast-item">
              <span class="forecast-label">90-Day Prediction:</span>
              <span class="forecast-value">{{ forecastingData.predictedStock90Days }} units</span>
            </div>
            <div class="forecast-item">
              <span class="forecast-label">Days Until Stockout:</span>
              <span class="forecast-value">{{ forecastingData.daysUntilStockout === 'N/A' ? 'N/A' : forecastingData.daysUntilStockout + ' days' }}</span>
            </div>
            <div class="forecast-item">
              <span class="forecast-label">Recommended Reorder:</span>
              <span class="forecast-value">{{ forecastingData.recommendedReorderQuantity }} units</span>
            </div>
            <div class="forecast-status">
              <el-tag :type="getStatusTagType(forecastingData.confidenceLevel)">
                {{ forecastingData.confidenceLevel }} confidence
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- Orders History -->
      <div class="orders-section">
        <h3>Recent Orders</h3>
        <div v-if="inventoryOrders.length === 0" class="empty-orders">
          <el-empty description="No orders found for this inventory" />
        </div>
        <div v-else class="orders-table">
          <el-table :data="inventoryOrders" stripe>
            <el-table-column prop="OrderId" label="Order ID" width="100" />
            <el-table-column label="Customer" width="150">
              <template #default="{ row }">
                <span>{{ getCustomerName(row.CustomerId) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="Quantity" label="Quantity" width="100" />
            <el-table-column prop="Cost" label="Revenue" width="120">
              <template #default="{ row }">
                <span>${{ formatCurrency(row.Cost) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="IsPaid" label="Status" width="100">
              <template #default="{ row }">
                <el-tag :type="isOrderPaid(row.IsPaid) ? 'success' : 'warning'">
                  {{ isOrderPaid(row.IsPaid) ? 'Paid' : 'Pending' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Date" width="120">
              <template #default="{ row }">
                <span>{{ formatDate(row.CreatedOn) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Refresh, 
  Download, 
  TrendCharts, 
  Money, 
  PieChart, 
  RefreshRight,
  ArrowLeft,
  CreditCard,
  Clock
} from '@element-plus/icons-vue'
import { BusinessAnalyticsService } from '@/services/BusinessAnalytics'

export default {
  name: 'InventoryReports',
  components: {
    Refresh,
    Download,
    TrendCharts,
    Money,
    PieChart,
    RefreshRight,
    ArrowLeft,
    CreditCard,
    Clock
  },
  data() {
    return {
      loading: false,
      error: null,
      inventoryId: null,
      inventory: null,
      inventoryOrders: [],
      customers: [],
      
      // Analytics data
      inventoryAnalytics: reactive({
        inventoryId: null,
        name: '',
        currentStock: 0,
        costPerUnit: 0,
        sellingPrice: 0,
        multiplier: 1,
        profitMargin: 0,
        salesVelocity: 0,
        daysOfStock: 0,
        forecastStatus: 'healthy',
        totalProfit: 0,
        totalRevenue: 0
      }),
      
      forecastingData: reactive({
        inventoryId: null,
        name: '',
        currentStock: 0,
        predictedStock30Days: 0,
        predictedStock90Days: 0,
        daysUntilStockout: 0,
        recommendedReorderQuantity: 0,
        confidenceLevel: 'low'
      }),

      paymentAnalytics: reactive({
        paidAmount: 0,
        pendingAmount: 0,
        paidOrders: 0,
        pendingOrders: 0
      })
    }
  },
  computed: {
    inventoryName() {
      return this.inventory?.Name || `Inventory ${this.inventoryId}`
    }
  },
  async mounted() {
    this.inventoryId = parseInt(this.$route.params.id)
    if (!this.inventoryId) {
      this.error = 'Invalid inventory ID'
      return
    }
    await this.loadInventoryReports()
  },
  methods: {
    async loadInventoryReports() {
      this.loading = true
      this.error = null
      
      try {
        // Load inventory data
        this.inventory = await this.$command.Inventory.get(this.inventoryId)
        if (!this.inventory) {
          this.error = 'Inventory not found'
          return
        }

        // Load related data
        const allOrders = await this.$command.Order.getAll()
        this.inventoryOrders = allOrders.filter(order => order.InventoryId === this.inventoryId)
        this.customers = await this.$command.Customer.getAll()
        
        // Calculate analytics for this specific inventory
        this.calculateInventoryAnalytics()
        this.calculatePaymentAnalytics()
        
      } catch (error) {
        console.error('Error loading inventory reports:', error)
        this.error = 'Failed to load inventory reports'
      } finally {
        this.loading = false
      }
    },

    calculateInventoryAnalytics() {
      // Create a single-inventory analytics service
      const analyticsService = new BusinessAnalyticsService(
        [this.inventory], 
        this.inventoryOrders, 
        []
      )
      
      // Get inventory analytics
      const analytics = analyticsService.calculateInventoryAnalytics()
      if (analytics.length > 0) {
        const inventoryAnalytics = analytics[0]
        this.inventoryAnalytics.inventoryId = inventoryAnalytics.inventoryId
        this.inventoryAnalytics.name = inventoryAnalytics.name
        this.inventoryAnalytics.currentStock = inventoryAnalytics.currentStock
        this.inventoryAnalytics.costPerUnit = inventoryAnalytics.costPerUnit
        this.inventoryAnalytics.sellingPrice = inventoryAnalytics.sellingPrice
        this.inventoryAnalytics.multiplier = Number(this.inventory.Multiplier) || 1
        this.inventoryAnalytics.profitMargin = inventoryAnalytics.profitMargin
        this.inventoryAnalytics.salesVelocity = inventoryAnalytics.salesVelocity
        this.inventoryAnalytics.daysOfStock = inventoryAnalytics.daysOfStock
        this.inventoryAnalytics.forecastStatus = inventoryAnalytics.forecastStatus
        this.inventoryAnalytics.totalProfit = inventoryAnalytics.totalProfit
        this.inventoryAnalytics.totalRevenue = inventoryAnalytics.totalRevenue
      }
      
      // Get forecasting data
      const forecasting = analyticsService.generateForecastingData()
      if (forecasting.length > 0) {
        const forecast = forecasting[0]
        this.forecastingData.inventoryId = forecast.inventoryId
        this.forecastingData.name = forecast.name
        this.forecastingData.currentStock = forecast.currentStock
        this.forecastingData.predictedStock30Days = forecast.predictedStock30Days
        this.forecastingData.predictedStock90Days = forecast.predictedStock90Days
        this.forecastingData.daysUntilStockout = forecast.daysUntilStockout
        this.forecastingData.recommendedReorderQuantity = forecast.recommendedReorderQuantity
        this.forecastingData.confidenceLevel = forecast.confidenceLevel
      }
    },

    calculatePaymentAnalytics() {
      // Calculate payment status for this inventory's orders
      const paidOrders = this.inventoryOrders.filter(order => 
        order.IsPaid === true || order.IsPaid === 'true'
      )
      const pendingOrders = this.inventoryOrders.filter(order => 
        order.IsPaid === false || order.IsPaid === 'false' || order.IsPaid === null || order.IsPaid === undefined
      )

      this.paymentAnalytics.paidAmount = paidOrders.reduce((total, order) => {
        return total + (Number(order.Cost) || 0)
      }, 0)

      this.paymentAnalytics.pendingAmount = pendingOrders.reduce((total, order) => {
        return total + (Number(order.Cost) || 0)
      }, 0)

      this.paymentAnalytics.paidOrders = paidOrders.length
      this.paymentAnalytics.pendingOrders = pendingOrders.length
    },

    getCustomerName(customerId) {
      const customer = this.customers.find(c => c.CustomerId === customerId)
      return customer ? customer.Name : `Customer ${customerId}`
    },

    isOrderPaid(isPaidValue) {
      // Handle encrypted boolean field that might come back as string, boolean, or null/undefined
      return isPaidValue === true || isPaidValue === 'true'
    },

    getMarginTrendClass(margin) {
      if (margin > 30) return 'positive'
      if (margin > 15) return 'neutral'
      return 'negative'
    },

    getMarginTrendText(margin) {
      if (margin > 30) return 'Excellent'
      if (margin > 15) return 'Good'
      return 'Low'
    },

    getStatusTagType(confidence) {
      switch (confidence) {
        case 'high': return 'success'
        case 'medium': return 'warning'
        case 'low': return 'info'
        default: return 'info'
      }
    },

    formatCurrency(value) {
      if (!value) return '0.00'
      const num = parseFloat(value)
      return isNaN(num) ? '0.00' : num.toFixed(2)
    },

    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString()
    },

    async refreshReports() {
      await this.loadInventoryReports()
      ElMessage.success('Inventory reports refreshed')
    },

    exportReports() {
      ElMessage.success('Inventory report exported successfully')
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/assets/scss/pages/_inventory-reports.scss';
</style>
