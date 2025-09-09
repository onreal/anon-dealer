<template>
  <div class="inventories-list">
    <div class="list-header">
      <h3>Inventories</h3>
      <el-button type="primary" @click="openAddInventory">
        <el-icon><Plus /></el-icon>
        Add Inventory
      </el-button>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="inventories.length === 0" class="empty-state">
      <el-empty description="No inventories found">
        <el-button type="primary" @click="openAddInventory">
          Create First Inventory
        </el-button>
      </el-empty>
    </div>

    <div v-else class="inventories-table">
      <el-table :data="inventories" stripe>
        <el-table-column prop="InventoryId" label="ID" width="80" />
        
        <el-table-column label="Item" width="150">
          <template #default="{ row }">
            <span>{{ getItemName(row.ItemId) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="Name" label="Name" width="150" />

        <el-table-column prop="Amount" label="Amount" width="100" />

        <el-table-column prop="Cost" label="Cost" width="100">
          <template #default="{ row }">
            <span>${{ formatCurrency(row.Cost) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="CostPerAmount" label="Sell Price" width="120">
          <template #default="{ row }">
            <span>${{ formatCurrency(row.CostPerAmount) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="AmountForCost" label="Units for Cost" width="120" />

        <el-table-column prop="Multiplier" label="Multiplier" width="100" />

        <el-table-column label="Created" width="120">
          <template #default="{ row }">
            <span>{{ formatDate(row.CreatedOn) }}</span>
          </template>
        </el-table-column>

                     <el-table-column label="Actions" width="180" fixed="right">
               <template #default="{ row }">
                 <div class="action-buttons">
                   <el-tooltip content="View Reports" placement="top">
                     <el-button 
                       size="small" 
                       type="primary" 
                       plain
                       @click="viewInventoryReports(row)"
                       class="action-btn reports-btn"
                     >
                       <el-icon><TrendCharts /></el-icon>
                     </el-button>
                   </el-tooltip>
                   <el-tooltip content="Edit Inventory" placement="top">
                     <el-button 
                       size="small" 
                       type="warning" 
                       plain
                       @click="editInventory(row)"
                       class="action-btn edit-btn"
                     >
                       <el-icon><Edit /></el-icon>
                     </el-button>
                   </el-tooltip>
                   <el-tooltip content="Delete Inventory" placement="top">
                     <el-button 
                       size="small" 
                       type="danger" 
                       plain
                       @click="deleteInventory(row)"
                       class="action-btn delete-btn"
                     >
                       <el-icon><Delete /></el-icon>
                     </el-button>
                   </el-tooltip>
                 </div>
               </template>
             </el-table-column>
      </el-table>
    </div>

    <!-- Inventory Drawer -->
    <InventoryDrawer
      v-model:isCreateInventory="showInventoryDrawer"
      :inventory="selectedInventory"
      @onCreate="loadInventories"
    />
  </div>
</template>

<script>
import InventoryDrawer from "./InventoryDrawer.vue"
import { TrendCharts, Edit, Delete } from '@element-plus/icons-vue'

export default {
  name: 'InventoriesList',
  components: {
    InventoryDrawer,
    TrendCharts,
    Edit,
    Delete
  },
  data() {
    return {
      inventories: [],
      items: [],
      loading: false,
      showInventoryDrawer: false,
      selectedInventory: null
    }
  },
  mounted() {
    this.loadInventories()
  },
  methods: {
    async loadInventories() {
      this.loading = true
      try {
        // Load inventories
        this.inventories = await this.$command.Inventory.getAll('desc')
        
        // Load items for display
        this.items = await this.$command.Item.getAll()
        
      } catch (error) {
        console.error('Error loading inventories:', error)
        this.$message.error('Failed to load inventories')
      } finally {
        this.loading = false
      }
    },

    openAddInventory() {
      this.selectedInventory = null
      this.showInventoryDrawer = true
    },

    editInventory(inventory) {
      this.selectedInventory = inventory
      this.showInventoryDrawer = true
    },

    viewInventoryReports(inventory) {
      this.$router.push(`/inventories/${inventory.InventoryId}/reports`)
    },

    async deleteInventory(inventory) {
      try {
        await this.$confirm(
          `Are you sure you want to delete inventory "${inventory.Name}"?`,
          'Confirm Delete',
          {
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }
        )

        await this.$command.Inventory.delete(inventory.InventoryId)
        this.$message.success('Inventory deleted successfully')
        this.loadInventories()
        
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Error deleting inventory:', error)
          this.$message.error('Failed to delete inventory')
        }
      }
    },

    getItemName(itemId) {
      const item = this.items.find(i => i.ItemId === itemId)
      return item ? item.Name : 'Unknown Item'
    },

    formatDate(date) {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString()
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
.inventories-list {
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

.inventories-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-table {
  width: 100%;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.action-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  margin-right: 0 !important;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.action-btn .el-icon {
  font-size: 14px;
}

.reports-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
}

.reports-btn:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  border-color: #5a6fd8;
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

@media (max-width: 768px) {
  .action-buttons {
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
</style>
