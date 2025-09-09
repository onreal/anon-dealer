<template>
  <div class="orders-list">
    <div class="list-header">
      <h3>Orders</h3>
      <el-button type="primary" @click="openAddOrder">
        <el-icon><Plus /></el-icon>
        Add Order
      </el-button>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="orders.length === 0" class="empty-state">
      <el-empty description="No orders found">
        <el-button type="primary" @click="openAddOrder">
          Create First Order
        </el-button>
      </el-empty>
    </div>

    <div v-else class="orders-table">
      <el-table :data="orders" stripe>
        <el-table-column prop="OrderId" label="Order ID" width="80" />
        
        <el-table-column label="Customer" width="150">
          <template #default="{ row }">
            <span>{{ getCustomerName(row.CustomerId) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Item" width="150">
          <template #default="{ row }">
            <span>{{ getInventoryName(row.InventoryId) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="cost" label="Cost" width="100">
          <template #default="{ row }">
            <span>${{ row.Cost?.toFixed(2) || '0.00' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="quantity" label="Quantity" width="100" />

        <el-table-column label="Total" width="120">
          <template #default="{ row }">
            <span>${{ ((row.Cost || 0) * (row.Quantity || 0)).toFixed(2) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Status" width="100">
          <template #default="{ row }">
            <el-tag :type="row.IsPaid ? 'success' : 'warning'">
              {{ row.IsPaid ? 'Paid' : 'Unpaid' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="notes" label="Notes" min-width="150" />

        <el-table-column label="Created" width="120">
          <template #default="{ row }">
            <span>{{ formatDate(row.CreatedOn) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editOrder(row)">
              <el-icon><Edit /></el-icon>
              Edit
            </el-button>
            <el-button size="small" type="danger" @click="deleteOrder(row)">
              <el-icon><Delete /></el-icon>
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Order Drawer -->
    <OrderDrawer
      v-model="showOrderDrawer"
      :order="selectedOrder"
      @order-saved="loadOrders"
    />
  </div>
</template>

<script>
import OrderDrawer from './OrderDrawer.vue'

export default {
  name: 'OrdersList',
  components: {
    OrderDrawer
  },
  data() {
    return {
      orders: [],
      customers: [],
      inventories: [],
      loading: false,
      showOrderDrawer: false,
      selectedOrder: null
    }
  },
  mounted() {
    this.loadOrders()
  },
  methods: {
    async loadOrders() {
      this.loading = true
      try {
        // Load orders
        this.orders = await this.$command.Order.getAll('desc')
        
        // Load customers and inventories for display
        this.customers = await this.$command.Customer.getAll()
        this.inventories = await this.$command.Inventory.getAll()
        
      } catch (error) {
        console.error('Error loading orders:', error)
        this.$message.error('Failed to load orders')
      } finally {
        this.loading = false
      }
    },

    openAddOrder() {
      this.selectedOrder = null
      this.showOrderDrawer = true
    },

    editOrder(order) {
      this.selectedOrder = order
      this.showOrderDrawer = true
    },

    async deleteOrder(order) {
      try {
        await this.$confirm(
          `Are you sure you want to delete order #${order.OrderId}?`,
          'Confirm Delete',
          {
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }
        )

        // Note: We need to add a delete method to OrderCommand
        // For now, we'll show a message
        this.$message.warning('Delete functionality needs to be implemented in OrderCommand')
        
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Error deleting order:', error)
          this.$message.error('Failed to delete order')
        }
      }
    },

    getCustomerName(customerId) {
      const customer = this.customers.find(c => c.CustomerId === customerId)
      return customer ? customer.Name : 'Unknown Customer'
    },

    getInventoryName(inventoryId) {
      const inventory = this.inventories.find(i => i.InventoryId === inventoryId)
      return inventory ? inventory.Name : 'Unknown Item'
    },

    formatDate(date) {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString()
    }
  }
}
</script>

<style scoped>
.orders-list {
  padding: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.list-header h3 {
  margin: 0;
  color: #303133;
}

.loading-container {
  padding: 20px;
}

.empty-state {
  padding: 40px;
  text-align: center;
}

.orders-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-table {
  width: 100%;
}

.el-button {
  margin-right: 8px;
}

.el-button:last-child {
  margin-right: 0;
}
</style>

