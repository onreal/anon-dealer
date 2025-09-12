<template>
  <div class="reports-container">
    <!-- Header Section -->
    <div class="reports-header">
      <div class="header-content">
        <h1>Business Analytics & Reports</h1>
        <p>Analyze your inventory performance, profit margins, and sales forecasting</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="refreshReports">
          <el-icon><Refresh /></el-icon>
          Refresh Data
        </el-button>
        <el-button type="success" @click="exportReports">
          <el-icon><Download /></el-icon>
          Export Reports
        </el-button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
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
            <h3>${{ formatCurrency(totalProfit) }}</h3>
            <p>Total Profit</p>
            <span class="trend positive">+{{ profitGrowth }}%</span>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="card-icon revenue">
            <el-icon><Money /></el-icon>
          </div>
          <div class="card-content">
            <h3>${{ formatCurrency(totalRevenue) }}</h3>
            <p>Total Revenue</p>
            <span class="trend positive">+{{ revenueGrowth }}%</span>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="card-icon margin">
            <el-icon><PieChart /></el-icon>
          </div>
          <div class="card-content">
            <h3>{{ averageMargin }}%</h3>
            <p>Average Margin</p>
            <span class="trend neutral">{{ marginTrend }}</span>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="card-icon turnover">
            <el-icon><RefreshRight /></el-icon>
          </div>
          <div class="card-content">
            <h3>{{ inventoryTurnover }}</h3>
            <p>Inventory Turnover</p>
            <span class="trend positive">High</span>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <div class="chart-container">
          <h3>Revenue & Profit Trends</h3>
          <div ref="revenueChart" class="chart"></div>
        </div>
        
        <div class="chart-container">
          <h3>Inventory Performance</h3>
          <div ref="inventoryChart" class="chart"></div>
        </div>
      </div>

      <!-- Detailed Analytics -->
      <div class="analytics-section">
        <div class="analytics-grid">
          <!-- Top Performing Items -->
          <div class="analytics-card">
            <h3>Top Performing Items</h3>
            <div class="performance-list">
              <div 
                v-for="item in topPerformingItems" 
                :key="item.ItemId"
                class="performance-item"
              >
                <div class="item-info">
                  <span class="item-name">{{ item.Name }}</span>
                  <span class="item-profit">${{ formatCurrency(item.TotalProfit) }}</span>
                </div>
                <div class="profit-bar">
                  <div 
                    class="profit-fill" 
                    :style="{ width: `${(item.TotalProfit / maxProfit) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Inventory Forecasting -->
          <div class="analytics-card">
            <h3>Inventory Forecasting</h3>
            <div class="forecast-list">
              <div 
                v-for="forecast in inventoryForecasts" 
                :key="forecast.InventoryId"
                class="forecast-item"
              >
                <div class="forecast-info">
                  <span class="forecast-name">{{ forecast.Name }}</span>
                  <span class="forecast-status" :class="forecast.Status">
                    {{ forecast.Status }}
                  </span>
                </div>
                <div class="forecast-details">
                  <span>Current: {{ forecast.CurrentStock }}</span>
                  <span>Predicted: {{ forecast.PredictedStock }}</span>
                  <span>Days Left: {{ forecast.DaysLeft }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Profit Margin Analysis -->
          <div class="analytics-card">
            <h3>Profit Margin Analysis</h3>
            <div class="margin-analysis">
              <div class="margin-item">
                <span class="margin-label">High Margin (&gt;50%)</span>
                <span class="margin-count">{{ highMarginCount }}</span>
              </div>
              <div class="margin-item">
                <span class="margin-label">Medium Margin (20-50%)</span>
                <span class="margin-count">{{ mediumMarginCount }}</span>
              </div>
              <div class="margin-item">
                <span class="margin-label">Low Margin (&lt;20%)</span>
                <span class="margin-count">{{ lowMarginCount }}</span>
              </div>
            </div>
          </div>

          <!-- Sales Velocity -->
          <div class="analytics-card">
            <h3>Sales Velocity</h3>
            <div class="velocity-list">
              <div 
                v-for="velocity in salesVelocity" 
                :key="velocity.InventoryId"
                class="velocity-item"
              >
                <div class="velocity-info">
                  <span class="velocity-name">{{ velocity.Name }}</span>
                  <span class="velocity-rate">{{ velocity.Rate }} units/day</span>
                </div>
                <div class="velocity-bar">
                  <div 
                    class="velocity-fill" 
                    :style="{ width: `${(velocity.Rate / maxVelocity) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
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
  RefreshRight 
} from '@element-plus/icons-vue'
import { BusinessAnalyticsService } from '@/services/BusinessAnalytics'

export default {
  name: 'Reports',
  components: {
    Refresh,
    Download,
    TrendCharts,
    Money,
    PieChart,
    RefreshRight
  },
  data() {
    return {
      loading: false,
      inventories: [],
      orders: [],
      items: [],
      customers: [],
      
      // Chart instances
      revenueChart: null,
      inventoryChart: null,
      
      // Analytics data
      analyticsData: reactive({
        totalProfit: 0,
        totalRevenue: 0,
        averageMargin: 0,
        inventoryTurnover: 0,
        profitGrowth: 0,
        revenueGrowth: 0,
        marginTrend: 'stable',
        topPerformingItems: [],
        inventoryForecasts: [],
        highMarginCount: 0,
        mediumMarginCount: 0,
        lowMarginCount: 0,
        salesVelocity: []
      })
    }
  },
  computed: {
    totalProfit() {
      return this.analyticsData.totalProfit
    },
    totalRevenue() {
      return this.analyticsData.totalRevenue
    },
    averageMargin() {
      return this.analyticsData.averageMargin
    },
    inventoryTurnover() {
      return this.analyticsData.inventoryTurnover
    },
    profitGrowth() {
      return this.analyticsData.profitGrowth
    },
    revenueGrowth() {
      return this.analyticsData.revenueGrowth
    },
    marginTrend() {
      return this.analyticsData.marginTrend
    },
    topPerformingItems() {
      return this.analyticsData.topPerformingItems
    },
    inventoryForecasts() {
      return this.analyticsData.inventoryForecasts
    },
    highMarginCount() {
      return this.analyticsData.highMarginCount
    },
    mediumMarginCount() {
      return this.analyticsData.mediumMarginCount
    },
    lowMarginCount() {
      return this.analyticsData.lowMarginCount
    },
    salesVelocity() {
      return this.analyticsData.salesVelocity
    },
    maxProfit() {
      return Math.max(...this.topPerformingItems.map(item => item.TotalProfit), 1)
    },
    maxVelocity() {
      return Math.max(...this.salesVelocity.map(v => v.Rate), 1)
    }
  },
  async mounted() {
    await this.loadReportsData()
    this.$nextTick(() => {
      this.initializeCharts()
    })
  },
  methods: {
    async loadReportsData() {
      this.loading = true
      try {
        // Load all data
        this.inventories = await this.$command.Inventory.getAll()
        this.orders = await this.$command.Order.getAll()
        this.items = await this.$command.Item.getAll()
        this.customers = await this.$command.Customer.getAll()
        
        // Calculate analytics
        this.calculateAnalytics()
        
      } catch (error) {
        console.error('Error loading reports data:', error)
        ElMessage.error('Failed to load reports data')
      } finally {
        this.loading = false
      }
    },

    calculateAnalytics() {
      // Use the BusinessAnalytics service for comprehensive calculations
      const analyticsService = new BusinessAnalyticsService(
        this.inventories, 
        this.orders, 
        this.items
      )
      
      // Calculate business metrics
      const businessMetrics = analyticsService.calculateBusinessMetrics()
      this.analyticsData.totalProfit = businessMetrics.totalProfit
      this.analyticsData.totalRevenue = businessMetrics.totalRevenue
      this.analyticsData.averageMargin = businessMetrics.averageMargin
      this.analyticsData.inventoryTurnover = businessMetrics.inventoryTurnover
      this.analyticsData.profitGrowth = businessMetrics.profitGrowth
      this.analyticsData.revenueGrowth = businessMetrics.revenueGrowth
      this.analyticsData.marginTrend = businessMetrics.marginTrend
      
      // Calculate performance rankings
      const performanceRankings = analyticsService.calculatePerformanceRankings()
      this.analyticsData.topPerformingItems = performanceRankings.slice(0, 5).map(item => ({
        ItemId: item.itemId,
        Name: item.name,
        TotalProfit: item.totalProfit
      }))
      
      // Calculate inventory forecasting
      const forecastingData = analyticsService.generateForecastingData()
      this.analyticsData.inventoryForecasts = forecastingData.map(forecast => ({
        InventoryId: forecast.inventoryId,
        Name: forecast.name,
        CurrentStock: forecast.currentStock,
        PredictedStock: forecast.predictedStock30Days,
        DaysLeft: forecast.daysUntilStockout,
        Status: this.mapForecastStatus(forecast.daysUntilStockout)
      }))
      
      // Calculate margin analysis
      const profitAnalysis = analyticsService.generateProfitAnalysis()
      this.analyticsData.highMarginCount = profitAnalysis.find(p => p.category.includes('High'))?.count || 0
      this.analyticsData.mediumMarginCount = profitAnalysis.find(p => p.category.includes('Medium'))?.count || 0
      this.analyticsData.lowMarginCount = profitAnalysis.find(p => p.category.includes('Low'))?.count || 0
      
      // Calculate sales velocity
      const inventoryAnalytics = analyticsService.calculateInventoryAnalytics()
      this.analyticsData.salesVelocity = inventoryAnalytics
        .sort((a, b) => b.salesVelocity - a.salesVelocity)
        .slice(0, 5)
        .map(analytics => ({
          InventoryId: analytics.inventoryId,
          Name: analytics.name,
          Rate: analytics.salesVelocity
        }))
    },
    
    mapForecastStatus(daysLeft) {
      if (daysLeft < 7) return 'critical'
      if (daysLeft < 14) return 'low'
      if (daysLeft < 30) return 'warning'
      return 'healthy'
    },


    initializeCharts() {
      this.createRevenueChart()
      this.createInventoryChart()
    },

    createRevenueChart() {
      // Mock chart data - in real implementation, use Chart.js or similar
      const chartElement = this.$refs.revenueChart
      if (chartElement) {
        chartElement.innerHTML = `
          <div class="mock-chart">
            <div class="chart-title">Revenue & Profit Trends (Last 6 Months)</div>
            <div class="chart-placeholder">
              📈 Revenue: $${this.formatCurrency(this.totalRevenue)}
              <br>💰 Profit: $${this.formatCurrency(this.totalProfit)}
              <br>📊 Growth: +${this.revenueGrowth}%
            </div>
          </div>
        `
      }
    },

    createInventoryChart() {
      // Mock chart data
      const chartElement = this.$refs.inventoryChart
      if (chartElement) {
        const avgMultiplier = this.inventories.length > 0 
          ? (this.inventories.reduce((sum, inv) => sum + (Number(inv.Multiplier) || 1), 0) / this.inventories.length).toFixed(2)
          : '1.00'
        
        chartElement.innerHTML = `
          <div class="mock-chart">
            <div class="chart-title">Inventory Performance</div>
            <div class="chart-placeholder">
              📦 Total Items: ${this.inventories.length}
              <br>🔄 Turnover Rate: ${this.inventoryTurnover}
              <br>📈 Average Margin: ${this.averageMargin}%
              <br>💰 Average Multiplier: ${avgMultiplier}x
            </div>
          </div>
        `
      }
    },

    formatCurrency(value) {
      if (!value) return '0.00'
      const num = parseFloat(value)
      return isNaN(num) ? '0.00' : num.toFixed(2)
    },

    async refreshReports() {
      await this.loadReportsData()
      this.$nextTick(() => {
        this.initializeCharts()
      })
      ElMessage.success('Reports data refreshed')
    },

    exportReports() {
      // Mock export functionality
      ElMessage.success('Reports exported successfully')
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/assets/scss/pages/_reports.scss';
</style>
