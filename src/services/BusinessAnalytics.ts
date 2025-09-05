/**
 * Business Analytics Service
 * Inspired by Palc repository calculations
 * Provides comprehensive business intelligence and forecasting
 */

export interface InventoryAnalytics {
  inventoryId: number
  name: string
  currentStock: number
  costPerUnit: number
  sellingPrice: number
  profitMargin: number
  salesVelocity: number
  daysOfStock: number
  forecastStatus: 'healthy' | 'warning' | 'low' | 'critical'
  totalProfit: number
  totalRevenue: number
}

export interface BusinessMetrics {
  totalProfit: number
  totalRevenue: number
  totalCost: number
  averageMargin: number
  inventoryTurnover: number
  profitGrowth: number
  revenueGrowth: number
  marginTrend: 'improving' | 'stable' | 'declining'
}

export interface ForecastingData {
  inventoryId: number
  name: string
  currentStock: number
  predictedStock30Days: number
  predictedStock90Days: number
  daysUntilStockout: number
  recommendedReorderQuantity: number
  confidenceLevel: 'high' | 'medium' | 'low'
}

export interface PerformanceRanking {
  itemId: number
  name: string
  totalProfit: number
  profitMargin: number
  salesVolume: number
  ranking: number
  trend: 'up' | 'down' | 'stable'
}

export class BusinessAnalyticsService {
  private inventories: any[] = []
  private orders: any[] = []
  private items: any[] = []

  constructor(inventories: any[], orders: any[], items: any[]) {
    this.inventories = inventories
    this.orders = orders
    this.items = items
  }

  /**
   * Calculate comprehensive business metrics
   */
  calculateBusinessMetrics(): BusinessMetrics {
    let totalProfit = 0
    let totalRevenue = 0
    let totalCost = 0
    let marginSum = 0
    let marginCount = 0

    // Calculate from orders
    this.orders.forEach(order => {
      const revenue = Number(order.Cost) || 0
      const cost = this.calculateOrderCost(order)
      
      totalRevenue += revenue
      totalCost += cost
      totalProfit += (revenue - cost)
    })

    // Calculate margins from inventories
    this.inventories.forEach(inventory => {
      const margin = this.calculateProfitMargin(inventory)
      if (margin !== null) {
        marginSum += margin
        marginCount++
      }
    })

    const averageMargin = marginCount > 0 ? marginSum / marginCount : 0
    const inventoryTurnover = this.calculateInventoryTurnover()
    
    return {
      totalProfit,
      totalRevenue,
      totalCost,
      averageMargin: Math.round(averageMargin * 100) / 100,
      inventoryTurnover: Math.round(inventoryTurnover * 100) / 100,
      profitGrowth: this.calculateGrowthRate('profit'),
      revenueGrowth: this.calculateGrowthRate('revenue'),
      marginTrend: this.determineMarginTrend(averageMargin)
    }
  }

  /**
   * Calculate inventory analytics for each item
   */
  calculateInventoryAnalytics(): InventoryAnalytics[] {
    return this.inventories.map(inventory => {
      const currentStock = Number(inventory.Amount) || 0
      const costPerUnit = this.calculateCostPerUnit(inventory)
      const baseSellingPrice = Number(inventory.CostPerAmount) || 0
      const multiplier = Number(inventory.Multiplier) || 1
      const finalSellingPrice = baseSellingPrice * multiplier
      const profitMargin = this.calculateProfitMargin(inventory)
      const salesVelocity = this.calculateSalesVelocity(inventory.InventoryId)
      const daysOfStock = salesVelocity > 0 ? Math.round(currentStock / salesVelocity) : 'N/A'
      const forecastStatus = this.determineForecastStatus(daysOfStock)
      
      const inventoryOrders = this.orders.filter(order => order.InventoryId === inventory.InventoryId)
      const totalProfit = inventoryOrders.reduce((sum, order) => {
        return sum + (Number(order.Cost) || 0) - this.calculateOrderCost(order)
      }, 0)
      
      const totalRevenue = inventoryOrders.reduce((sum, order) => {
        return sum + (Number(order.Cost) || 0)
      }, 0)

      return {
        inventoryId: inventory.InventoryId,
        name: inventory.Name,
        currentStock,
        costPerUnit,
        sellingPrice: finalSellingPrice,
        profitMargin: profitMargin || 0,
        salesVelocity: Math.round(salesVelocity * 100) / 100,
        daysOfStock,
        forecastStatus,
        totalProfit: Math.round(totalProfit * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100
      }
    })
  }

  /**
   * Generate forecasting data for inventory management
   */
  generateForecastingData(): ForecastingData[] {
    return this.inventories.map(inventory => {
      const currentStock = Number(inventory.Amount) || 0
      const salesVelocity = this.calculateSalesVelocity(inventory.InventoryId)
      
      const predictedStock30Days = salesVelocity > 0 ? Math.max(0, currentStock - (salesVelocity * 30)) : currentStock
      const predictedStock90Days = salesVelocity > 0 ? Math.max(0, currentStock - (salesVelocity * 90)) : currentStock
      const daysUntilStockout = salesVelocity > 0 ? Math.round(currentStock / salesVelocity) : 'N/A'
      
      // Calculate recommended reorder quantity based on sales velocity and lead time
      const leadTimeDays = 14 // Assume 14 days lead time
      const safetyStock = salesVelocity * leadTimeDays * 0.5 // 50% safety buffer
      const recommendedReorderQuantity = salesVelocity > 0 ? Math.round((salesVelocity * leadTimeDays) + safetyStock) : 0
      
      const confidenceLevel = this.calculateConfidenceLevel(inventory.InventoryId)

      return {
        inventoryId: inventory.InventoryId,
        name: inventory.Name,
        currentStock,
        predictedStock30Days: Math.round(predictedStock30Days),
        predictedStock90Days: Math.round(predictedStock90Days),
        daysUntilStockout,
        recommendedReorderQuantity,
        confidenceLevel
      }
    })
  }

  /**
   * Calculate performance rankings for items
   */
  calculatePerformanceRankings(): PerformanceRanking[] {
    const itemPerformance: { [key: number]: any } = {}

    // Aggregate data by item
    this.orders.forEach(order => {
      const inventory = this.inventories.find(inv => inv.InventoryId === order.InventoryId)
      if (inventory) {
        const itemId = inventory.ItemId
        const profit = (Number(order.Cost) || 0) - this.calculateOrderCost(order)
        const revenue = Number(order.Cost) || 0
        const quantity = Number(order.Quantity) || 0

        if (!itemPerformance[itemId]) {
          itemPerformance[itemId] = {
            itemId,
            name: this.getItemName(itemId),
            totalProfit: 0,
            totalRevenue: 0,
            totalQuantity: 0,
            orders: []
          }
        }

        itemPerformance[itemId].totalProfit += profit
        itemPerformance[itemId].totalRevenue += revenue
        itemPerformance[itemId].totalQuantity += quantity
        itemPerformance[itemId].orders.push(order)
      }
    })

    // Calculate metrics and rankings
    const rankings = Object.values(itemPerformance).map((item: any, index) => {
      const profitMargin = item.totalRevenue > 0 ? (item.totalProfit / item.totalRevenue) * 100 : 0
      const salesVolume = item.totalQuantity
      
      return {
        itemId: item.itemId,
        name: item.name,
        totalProfit: Math.round(item.totalProfit * 100) / 100,
        profitMargin: Math.round(profitMargin * 100) / 100,
        salesVolume,
        ranking: index + 1,
        trend: this.calculateItemTrend(item.orders)
      }
    })

    // Sort by total profit
    return rankings.sort((a, b) => b.totalProfit - a.totalProfit)
  }

  /**
   * Calculate cost per unit for an inventory item
   */
  private calculateCostPerUnit(inventory: any): number {
    const cost = Number(inventory.Cost) || 0
    const amount = Number(inventory.Amount) || 0
    return amount > 0 ? cost / amount : 0
  }

  /**
   * Calculate profit margin percentage
   */
  private calculateProfitMargin(inventory: any): number | null {
    const costPerUnit = this.calculateCostPerUnit(inventory)
    const baseSellingPrice = Number(inventory.CostPerAmount) || 0
    const multiplier = Number(inventory.Multiplier) || 1
    const finalSellingPrice = baseSellingPrice * multiplier
    
    if (finalSellingPrice > 0 && costPerUnit > 0) {
      return ((finalSellingPrice - costPerUnit) / finalSellingPrice) * 100
    }
    return null
  }

  /**
   * Calculate sales velocity (units per day)
   */
  private calculateSalesVelocity(inventoryId: number): number {
    const inventoryOrders = this.orders.filter(order => order.InventoryId === inventoryId)
    const totalQuantity = inventoryOrders.reduce((sum, order) => sum + (Number(order.Quantity) || 0), 0)
    
    // Calculate actual time period from orders
    if (inventoryOrders.length === 0) {
      return 0 // No sales velocity if no orders
    }
    
    // Get the date range of orders
    const orderDates = inventoryOrders.map(order => new Date(order.CreatedOn))
    const earliestOrder = new Date(Math.min(...orderDates))
    const latestOrder = new Date(Math.max(...orderDates))
    const daysDiff = Math.max(1, Math.ceil((latestOrder.getTime() - earliestOrder.getTime()) / (1000 * 60 * 60 * 24)))
    
    return totalQuantity / daysDiff
  }

  /**
   * Calculate order cost based on inventory
   */
  private calculateOrderCost(order: any): number {
    const inventory = this.inventories.find(inv => inv.InventoryId === order.InventoryId)
    if (inventory) {
      const costPerUnit = this.calculateCostPerUnit(inventory)
      return costPerUnit * (Number(order.Quantity) || 0)
    }
    return 0
  }

  /**
   * Calculate inventory turnover ratio
   */
  private calculateInventoryTurnover(): number {
    const totalInventoryValue = this.inventories.reduce((sum, inv) => {
      return sum + (Number(inv.Cost) || 0)
    }, 0)
    
    const totalSales = this.orders.reduce((sum, order) => {
      return sum + (Number(order.Cost) || 0)
    }, 0)
    
    return totalInventoryValue > 0 ? totalSales / totalInventoryValue : 0
  }

  /**
   * Determine forecast status based on days of stock
   */
  private determineForecastStatus(daysOfStock: number | string): 'healthy' | 'warning' | 'low' | 'critical' {
    if (daysOfStock === 'N/A') return 'healthy' // No sales data, assume healthy
    if (daysOfStock < 7) return 'critical'
    if (daysOfStock < 14) return 'low'
    if (daysOfStock < 30) return 'warning'
    return 'healthy'
  }

  /**
   * Calculate confidence level for forecasting
   */
  private calculateConfidenceLevel(inventoryId: number): 'high' | 'medium' | 'low' {
    const inventoryOrders = this.orders.filter(order => order.InventoryId === inventoryId)
    
    if (inventoryOrders.length >= 10) return 'high'
    if (inventoryOrders.length >= 5) return 'medium'
    return 'low'
  }

  /**
   * Calculate growth rate (mock implementation)
   */
  private calculateGrowthRate(type: 'profit' | 'revenue'): number {
    // In a real implementation, this would compare with previous periods
    return Math.round(Math.random() * 20 + 5) // Mock 5-25% growth
  }

  /**
   * Determine margin trend
   */
  private determineMarginTrend(averageMargin: number): 'improving' | 'stable' | 'declining' {
    if (averageMargin > 40) return 'improving'
    if (averageMargin > 20) return 'stable'
    return 'declining'
  }

  /**
   * Calculate item trend based on order history
   */
  private calculateItemTrend(orders: any[]): 'up' | 'down' | 'stable' {
    if (orders.length < 2) return 'stable'
    
    // Simple trend calculation based on recent vs older orders
    const recentOrders = orders.slice(-3)
    const olderOrders = orders.slice(0, -3)
    
    const recentAvg = recentOrders.reduce((sum, order) => sum + (Number(order.Quantity) || 0), 0) / recentOrders.length
    const olderAvg = olderOrders.reduce((sum, order) => sum + (Number(order.Quantity) || 0), 0) / olderOrders.length
    
    if (recentAvg > olderAvg * 1.1) return 'up'
    if (recentAvg < olderAvg * 0.9) return 'down'
    return 'stable'
  }

  /**
   * Get item name by ID
   */
  private getItemName(itemId: number): string {
    const item = this.items.find(item => item.ItemId === itemId)
    return item ? item.Name : `Item ${itemId}`
  }

  /**
   * Generate profit analysis by category
   */
  generateProfitAnalysis(): { category: string; profit: number; margin: number; count: number }[] {
    const categories = {
      'High Margin (>50%)': { profit: 0, margin: 0, count: 0 },
      'Medium Margin (20-50%)': { profit: 0, margin: 0, count: 0 },
      'Low Margin (<20%)': { profit: 0, margin: 0, count: 0 }
    }

    this.inventories.forEach(inventory => {
      const margin = this.calculateProfitMargin(inventory)
      if (margin !== null) {
        const inventoryOrders = this.orders.filter(order => order.InventoryId === inventory.InventoryId)
        const profit = inventoryOrders.reduce((sum, order) => {
          return sum + (Number(order.Cost) || 0) - this.calculateOrderCost(order)
        }, 0)

        if (margin > 50) {
          categories['High Margin (>50%)'].profit += profit
          categories['High Margin (>50%)'].margin += margin
          categories['High Margin (>50%)'].count++
        } else if (margin >= 20) {
          categories['Medium Margin (20-50%)'].profit += profit
          categories['Medium Margin (20-50%)'].margin += margin
          categories['Medium Margin (20-50%)'].count++
        } else {
          categories['Low Margin (<20%)'].profit += profit
          categories['Low Margin (<20%)'].margin += margin
          categories['Low Margin (<20%)'].count++
        }
      }
    })

    return Object.entries(categories).map(([category, data]) => ({
      category,
      profit: Math.round(data.profit * 100) / 100,
      margin: data.count > 0 ? Math.round((data.margin / data.count) * 100) / 100 : 0,
      count: data.count
    }))
  }
}
