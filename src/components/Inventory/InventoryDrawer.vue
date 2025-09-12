<template>
  <el-drawer 
    v-model="isCreateInventory" 
    direction="rtl" 
    :append-to-body="true" 
    :size="isMobile ? '100%' : '60%'"
    class="inventory-drawer"
  >
    <template #header>
      <div class="drawer-header">
        <h2>{{ isEditing ? 'Edit Inventory' : 'Create New Inventory' }}</h2>
        <p>{{ isEditing ? 'Update inventory details' : 'Track stock and pricing for your items' }}</p>
      </div>
    </template>
    
    <template #default>
      <el-steps 
        :active="active" 
        finish-status="success" 
        class="inventory-steps"
        :space="200"
      >
        <el-step title="Basic Info" description="Item & Name"></el-step>
        <el-step title="Purchase" description="Cost & Amount"></el-step>
        <el-step title="Pricing" description="Sell Price"></el-step>
      </el-steps>

      <ElForm
        ref="inventoryFormRef"
        :model="inventory"
        :rules="rules"
        label-position="top"
        class="inventory-form"
      >
        <!-- Step 1: Basic Information -->
        <div v-if="active === 0" class="form-step">
          <h3>Basic Information</h3>
          
          <ElFormItem label="Inventory Name" prop="Name">
            <ElInput 
              v-model="inventory.Name" 
              placeholder="Enter inventory name"
              :disabled="loading"
              @keydown.enter.prevent="nextStep"
            />
            <div class="field-hint">Choose a descriptive name for this inventory</div>
          </ElFormItem>

          <ElFormItem label="Select Item" prop="ItemId">
            <ElSelect 
              v-model="inventory.ItemId" 
              placeholder="Select an item"
              :disabled="loading"
              style="width: 100%"
              filterable
            >
              <el-option 
                v-for="item in items" 
                :key="item.ItemId" 
                :label="item.Name" 
                :value="item.ItemId"
              >
                <div class="item-option">
                  <span>{{ item.Name }}</span>
                  <span class="item-type">{{ item.Type }}</span>
                </div>
              </el-option>
            </ElSelect>
            <div class="field-hint">Select the item this inventory is for</div>
          </ElFormItem>
        </div>

        <!-- Step 2: Purchase Information -->
        <div v-if="active === 1" class="form-step">
          <h3>Purchase Information</h3>
          
          <ElFormItem label="Amount Purchased" prop="Amount">
            <el-input-number 
              v-model="inventory.Amount" 
              :min="1" 
              :precision="2"
              placeholder="Enter amount"
              :disabled="loading"
              style="width: 100%"
            />
            <div class="field-hint">How many units did you purchase?</div>
          </ElFormItem>

          <ElFormItem label="Total Cost" prop="Cost">
            <el-input-number 
              v-model="inventory.Cost" 
              :min="0" 
              :precision="2"
              placeholder="Enter total cost"
              :disabled="loading"
              style="width: 100%"
            />
            <div class="field-hint">What was the total cost for this purchase?</div>
          </ElFormItem>

          <div v-if="inventory.Amount && inventory.Cost" class="cost-calculation">
            <ElAlert
              :title="`Cost per unit: ${(inventory.Cost / inventory.Amount).toFixed(2)}`"
              type="info"
              :closable="false"
            />
          </div>
        </div>

        <!-- Step 3: Pricing Information -->
        <div v-if="active === 2" class="form-step">
          <h3>Pricing Information</h3>
          
          <ElFormItem label="Cost Per Unit" prop="CostPerAmount">
            <el-input-number 
              v-model="inventory.CostPerAmount" 
              :min="0" 
              :precision="2"
              placeholder="Enter cost per unit"
              :disabled="loading"
              style="width: 100%"
            />
            <div class="field-hint">Cost per individual unit</div>
          </ElFormItem>

          <ElFormItem label="Units for Cost" prop="AmountForCost">
            <el-input-number 
              v-model="inventory.AmountForCost" 
              :min="1" 
              :precision="2"
              placeholder="Enter units for cost"
              :disabled="loading"
              style="width: 100%"
            />
            <div class="field-hint">How many units does the cost apply to?</div>
          </ElFormItem>

          <ElFormItem label="Profit Multiplier" prop="Multiplier">
            <div class="multiplier-section">
              <el-slider 
                v-model="inventory.Multiplier" 
                :min="1" 
                :max="5" 
                :step="0.1"
                :disabled="loading"
                show-stops
                :marks="multiplierMarks"
              />
              <div class="multiplier-display">
                <span class="multiplier-value">{{ inventory.Multiplier }}x</span>
                <span class="multiplier-price">
                  Sell Price: {{ (inventory.CostPerAmount * inventory.Multiplier).toFixed(2) }}
                </span>
              </div>
            </div>
            <div class="field-hint">Adjust the multiplier to set your selling price</div>
          </ElFormItem>
        </div>
      </ElForm>
    </template>
    
    <template #footer>
      <div class="drawer-footer">
        <div class="footer-left">
          <ElButton @click="closeDrawer" :disabled="loading">
            Cancel
          </ElButton>
        </div>
        
        <div class="footer-center">
          <ElButton 
            v-if="active > 0" 
            @click="prevStep" 
            :disabled="loading"
          >
            Previous
          </ElButton>
          <ElButton 
            v-if="active < 2" 
            type="primary" 
            @click="nextStep"
            :disabled="!canProceed"
          >
            Next
          </ElButton>
        </div>
        
        <div class="footer-right">
          <ElButton 
            v-if="active === 2"
            type="success" 
            @click="createInventory"
            :loading="loading"
            :disabled="!canCreate"
          >
            {{ loading ? 'Creating...' : 'Create Inventory' }}
          </ElButton>
        </div>
      </div>
    </template>
  </el-drawer>
</template>

<script lang="ts" setup>
import { getCurrentInstance, ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  isCreateInventory: boolean
  inventory?: any
}>()

const emit = defineEmits<{
  'update:isCreateInventory': [value: boolean]
}>()

const isCreateInventory = computed({
  get: () => props.isCreateInventory,
  set: (value: boolean) => emit('update:isCreateInventory', value)
})

const isEditing = computed(() => {
  return props.inventory && props.inventory.InventoryId
})
const internalInstance = getCurrentInstance()
const inventoryFormRef = ref()

let inventory = reactive({
  Name: '',
  ItemId: null as number | null,
  Amount: null as number | null,
  Cost: null as number | null,
  CostPerAmount: null as number | null,
  AmountForCost: null as number | null,
  Multiplier: 2.0,
  CreatedOn: null as Date | null,
  ModifiedOn: null as Date | null,
})

let items = ref([])
let loading = ref(false)
let active = ref(0)

// Mobile detection
const isMobile = ref(false)

const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

const multiplierMarks = {
  1: '1x',
  2: '2x',
  3: '3x',
  4: '4x',
  5: '5x'
}

const rules = {
  Name: [
    { required: true, message: 'Please enter inventory name', trigger: 'blur' },
    { min: 2, message: 'Name must be at least 2 characters', trigger: 'blur' }
  ],
  ItemId: [
    { required: true, message: 'Please select an item', trigger: 'change' }
  ],
  Amount: [
    { required: true, message: 'Please enter amount', trigger: 'blur' },
    { type: 'number', min: 1, message: 'Amount must be at least 1', trigger: 'blur' }
  ],
  Cost: [
    { required: true, message: 'Please enter cost', trigger: 'blur' },
    { type: 'number', min: 0, message: 'Cost must be 0 or greater', trigger: 'blur' }
  ],
  CostPerAmount: [
    { required: true, message: 'Please enter cost per unit', trigger: 'blur' },
    { type: 'number', min: 0, message: 'Cost per unit must be 0 or greater', trigger: 'blur' }
  ],
  AmountForCost: [
    { required: true, message: 'Please enter units for cost', trigger: 'blur' },
    { type: 'number', min: 1, message: 'Units must be at least 1', trigger: 'blur' }
  ]
}

const canProceed = computed(() => {
  switch (active.value) {
    case 0:
      return inventory.Name && inventory.ItemId
    case 1:
      return inventory.Amount && inventory.Cost
    case 2:
      return inventory.CostPerAmount && inventory.AmountForCost
    default:
      return false
  }
})

const canCreate = computed(() => {
  return inventory.Name && inventory.ItemId && inventory.Amount && 
         inventory.Cost && inventory.CostPerAmount && inventory.AmountForCost
})

onMounted(async () => {
  await loadItems()
  if (isEditing.value) {
    populateForm()
  }
})

// Watch for inventory prop changes
watch(() => props.inventory, (newInventory) => {
  if (newInventory && isEditing.value) {
    populateForm()
  }
}, { immediate: true })

const populateForm = () => {
  if (props.inventory) {
    inventory.Name = props.inventory.Name || ''
    inventory.ItemId = props.inventory.ItemId || null
    inventory.Amount = props.inventory.Amount || null
    inventory.Cost = props.inventory.Cost || null
    inventory.CostPerAmount = props.inventory.CostPerAmount || null
    inventory.AmountForCost = props.inventory.AmountForCost || null
    inventory.Multiplier = props.inventory.Multiplier || 2.0
  }
}

const loadItems = async () => {
  try {
    // Check if commands are available
    if (!internalInstance?.appContext.config.globalProperties.$command) {
      return
    }

    const itemsData = await internalInstance?.appContext.config.globalProperties.$command.Item.getAll()
    items.value = itemsData || []
  } catch (error) {
    console.error('Error loading items:', error)
    ElMessage.error('Failed to load items')
  }
}

const nextStep = async () => {
  if (!inventoryFormRef.value) return
  
  try {
    // Validate current step
    const fieldsToValidate = getFieldsForStep(active.value)
    await inventoryFormRef.value.validateField(fieldsToValidate)
    
    if (active.value < 2) {
      active.value++
      
      // Auto-calculate cost per unit if not set
      if (active.value === 2 && inventory.Amount && inventory.Cost && !inventory.CostPerAmount) {
        inventory.CostPerAmount = inventory.Cost / inventory.Amount
      }
    }
  } catch (error) {
    console.error('Validation error:', error)
  }
}

const prevStep = () => {
  if (active.value > 0) {
    active.value--
  }
}

const getFieldsForStep = (step: number) => {
  switch (step) {
    case 0:
      return ['Name', 'ItemId']
    case 1:
      return ['Amount', 'Cost']
    case 2:
      return ['CostPerAmount', 'AmountForCost']
    default:
      return []
  }
}

const createInventory = async () => {
  if (!inventoryFormRef.value) return
  
  try {
    await inventoryFormRef.value.validate()
    loading.value = true
    
    // Validate required fields
    if (!inventory.Name || !inventory.ItemId || !inventory.Amount || !inventory.Cost || 
        !inventory.CostPerAmount || !inventory.AmountForCost) {
      throw new Error('All required fields must be filled')
    }
    
    const inventoryData = {
      Name: inventory.Name,
      ItemId: inventory.ItemId,
      Amount: inventory.Amount,
      Cost: inventory.Cost,
      CostPerAmount: inventory.CostPerAmount,
      AmountForCost: inventory.AmountForCost,
      Multiplier: inventory.Multiplier || 2.0,
      ModifiedOn: new Date()
    }
    
    if (isEditing.value) {
      // Update existing inventory
      inventoryData.InventoryId = props.inventory.InventoryId
      inventoryData.CreatedOn = props.inventory.CreatedOn
      await internalInstance?.appContext.config.globalProperties.$command.Inventory.update(inventoryData)
      ElMessage.success('Inventory updated successfully')
    } else {
      // Create new inventory
      inventoryData.CreatedOn = new Date()
      await internalInstance?.appContext.config.globalProperties.$command.Inventory.add(inventoryData)
      ElMessage.success('Inventory created successfully!')
      resetForm()
    }
    
    closeDrawer()
    emit('onCreate')
    
  } catch (error) {
    console.error('Error creating inventory:', error)
    ElMessage.error('Failed to create inventory')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  inventory.Name = ''
  inventory.ItemId = null
  inventory.Amount = null
  inventory.Cost = null
  inventory.CostPerAmount = null
  inventory.AmountForCost = null
  inventory.Multiplier = 2.0
  active.value = 0
}

const closeDrawer = () => {
  resetForm()
  isCreateInventory.value = false
}

// Watch for drawer visibility changes to apply dark mode
watch(isCreateInventory, (newVisible) => {
  if (newVisible) {
    // Check if dark mode is enabled
    const isDarkMode = document.documentElement.classList.contains('dark')
    if (isDarkMode) {
      // Force dark mode styles on drawer elements
      setTimeout(() => {
        try {
          const drawer = document.querySelector('.el-drawer')
          const header = document.querySelector('.el-drawer__header')
          const body = document.querySelector('.el-drawer__body')
          const footer = document.querySelector('.el-drawer__footer')
          const title = document.querySelector('.el-drawer__title')
          const closeBtn = document.querySelector('.el-drawer__close-btn')
          
          if (drawer && drawer.parentNode) {
            drawer.style.backgroundColor = '#1e293b'
            drawer.style.color = '#f8fafc'
          }
          if (header && header.parentNode) {
            header.style.backgroundColor = '#1e293b'
            header.style.color = '#f8fafc'
            header.style.borderBottomColor = '#334155'
          }
          if (body && body.parentNode) {
            body.style.backgroundColor = '#1e293b'
            body.style.color = '#f8fafc'
          }
          if (footer && footer.parentNode) {
            footer.style.backgroundColor = '#1e293b'
            footer.style.color = '#f8fafc'
            footer.style.borderTopColor = '#334155'
          }
          if (title && title.parentNode) {
            title.style.color = '#f8fafc'
          }
          if (closeBtn && closeBtn.parentNode) {
            closeBtn.style.color = '#f8fafc'
          }
        } catch (error) {
          console.warn('Error applying dark mode to drawer:', error)
        }
      }, 200)
    }
  }
})
</script>

<style lang="scss" scoped>
@import 'src/assets/scss/components/inventory/_inventory-drawer.scss';
</style>
