<template>
  <div class="items-list-container">
    <div class="items-header">
      <h2>Items</h2>
      <div class="header-actions">
        <ElButton @click="isCreateItem = true" type="primary">
          <ElIcon><Plus /></ElIcon>
          Add Item
        </ElButton>
        <ElButton @click="loadItems" type="default" :loading="loading">
          <ElIcon><Refresh /></ElIcon>
          Refresh
        </ElButton>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <ElIcon class="is-loading"><Loading /></ElIcon>
      <p>Loading items...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <ElAlert
        :title="error"
        type="error"
        :closable="false"
        show-icon
      />
      <ElButton @click="loadItems" type="primary" style="margin-top: 16px">
        Try Again
      </ElButton>
    </div>

    <div v-else-if="items.length === 0" class="empty-state">
      <ElIcon><Box /></ElIcon>
      <h3>No Items Yet</h3>
      <p>Create your first item to get started</p>
      <ElButton @click="isCreateItem = true" type="primary">
        <ElIcon><Plus /></ElIcon>
        Create First Item
      </ElButton>
    </div>

    <div v-else class="items-grid">
      <div v-for="item in items" :key="item.ItemId" class="item-card">
        <div class="item-image">
          <img v-if="item.Image" :src="item.Image" :alt="item.Name" />
          <div v-else class="no-image">
            <ElIcon><Picture /></ElIcon>
          </div>
        </div>
        <div class="item-content">
          <h3>{{ item.Name }}</h3>
          <p class="item-type">{{ item.Type }}</p>
          <p v-if="item.Description" class="item-description">{{ item.Description }}</p>
          <div class="item-meta">
            <span class="created-date">{{ formatDate(item.CreatedOn) }}</span>
          </div>
        </div>
        <div class="item-actions">
          <ElButton size="small" type="primary" plain @click="editItem(item)">
            <ElIcon><Edit /></ElIcon>
            Edit
          </ElButton>
          <ElButton size="small" type="danger" plain @click="deleteItem(item)">
            <ElIcon><Delete /></ElIcon>
            Delete
          </ElButton>
        </div>
      </div>
    </div>

    <ItemDrawer v-model:isCreateItem="isCreateItem" ref="itemDrawer" @onCreate="loadItems"/>
  </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance, onMounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Loading, Box, Picture, Edit, Delete } from '@element-plus/icons-vue'
import ItemDrawer from "./ItemDrawer.vue"

const isCreateItem = ref(false)

const items = ref<Array<{ [key: string]: any }>>([])
const loading = ref(false)
const error = ref('')
const internalInstance = getCurrentInstance()
const itemDrawer = ref()

const loadItems = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // Check if commands are available
    if (!internalInstance?.appContext.config.globalProperties.$command) {
      loading.value = false
      return
    }

    const itemsData = await internalInstance?.appContext.config.globalProperties.$command.Item.getAll('desc')
    
    // Check if data is encrypted
    if (itemsData && itemsData.length > 0) {
      const firstItem = itemsData[0]
      // Check if Name looks encrypted (starts with U2FsdGVkX1)
      const isEncrypted = firstItem.Name && firstItem.Name.startsWith('U2FsdGVkX1')
    }
    
    items.value = itemsData || []
  } catch (err) {
    console.error('ItemsList: Error loading items:', err)
    error.value = 'Failed to load items. Please try again.'
    ElMessage.error('Failed to load items')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'Unknown'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  } catch {
    return 'Invalid date'
  }
}

const editItem = (itemToEdit: any) => {
  if (itemDrawer.value) {
    itemDrawer.value.setupEditMode(itemToEdit)
    isCreateItem.value = true
  }
}

const deleteItem = async (item: any) => {
  try {
    // Check if item is used in any inventory
    loading.value = true
    const inventories = await internalInstance?.appContext.config.globalProperties.$command.Inventory.getAll()
    const itemUsedInInventories = inventories?.filter(inventory => inventory.ItemId === item.ItemId)
    
    if (itemUsedInInventories && itemUsedInInventories.length > 0) {
      ElMessage.error(`Cannot delete "${item.Name}" because it is used in ${itemUsedInInventories.length} inventory item(s). Please remove it from all inventories first.`)
      return
    }
    
    await ElMessageBox.confirm(
      `Are you sure you want to delete "${item.Name}"? This action cannot be undone.`,
      'Delete Item',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    await internalInstance?.appContext.config.globalProperties.$command.Item.delete(item.ItemId)
    
    ElMessage.success('Item deleted successfully!')
    await loadItems()
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error deleting item:', error)
      ElMessage.error('Failed to delete item')
    }
  } finally {
    loading.value = false
  }
}

// Expose loadItems method for parent components
defineExpose({
  loadItems
})

// Watch for changes in items array
watch(items, (newItems) => {
}, { deep: true })

onMounted(() => {
  loadItems()
})
</script>

<style lang="scss" scoped>
@import 'src/assets/scss/components/item/_items-list.scss';
</style>
