<template>
  <el-drawer 
    v-model="isCreateItem" 
    direction="rtl" 
    :append-to-body="true" 
    :size="isMobile ? '100%' : '50%'"
    class="item-drawer"
  >
    <template #header>
      <div class="drawer-header">
        <h2>{{ isEditing ? 'Edit Item' : 'Create New Item' }}</h2>
        <p>{{ isEditing ? 'Update your item information' : 'Add a new product or service to your catalog' }}</p>
      </div>
    </template>
    
    <template #default>
      <ElForm
        ref="itemFormRef"
        :model="item"
        :rules="rules"
        label-position="top"
        class="item-form"
      >
        <div class="form-section">
          <h3>Basic Information</h3>
          
          <ElFormItem label="Item Name" prop="Name">
            <ElInput 
              v-model="item.Name" 
              placeholder="Enter item name"
              :disabled="loading"
              @keydown.enter.prevent="createItem"
            />
            <div class="field-hint">Choose a clear, descriptive name</div>
          </ElFormItem>

          <ElFormItem label="Item Type" prop="Type">
            <ElSelect
              v-model="item.Type"
              placeholder="Select item type"
              :disabled="loading"
              style="width: 100%"
            >
              <el-option
                v-for="(type, key) in types"
                :key="key"
                :label="type"
                :value="type"
              />
            </ElSelect>
            <div class="field-hint">Choose the category that best fits your item</div>
          </ElFormItem>

          <ElFormItem label="Description" prop="Description">
            <ElInput 
              v-model="item.Description" 
              type="textarea" 
              :rows="4"
              placeholder="Describe your item..."
              :disabled="loading"
            />
            <div class="field-hint">Provide details about your item (optional)</div>
          </ElFormItem>
        </div>

        <div class="form-section">
          <h3>Image</h3>
          
          <ElFormItem label="Item Image">
            <ElUpload
              ref="uploadRef"
              :limit="1"
              :on-exceed="handleExceed"
              :auto-upload="false"
              :on-change="handleFileChange"
              accept="image/*"
              class="image-upload"
            >
              <template #trigger>
                <div class="upload-area">
                  <ElIcon v-if="!item.Image" class="upload-icon"><Plus /></ElIcon>
                  <img v-else :src="item.Image" class="preview-image" />
                  <div class="upload-text">
                    {{ item.Image ? 'Change Image' : 'Click to upload image' }}
                  </div>
                </div>
              </template>
            </ElUpload>
            <div class="field-hint">Upload an image for your item (optional)</div>
          </ElFormItem>
        </div>
      </ElForm>
    </template>
    
    <template #footer>
      <div class="drawer-footer">
        <ElButton @click="closeDrawer" :disabled="loading">
          Cancel
        </ElButton>
        <ElButton 
          type="primary" 
          @click="isEditing ? updateItem() : createItem()"
          :loading="loading"
          :disabled="!item.Name || !item.Type"
        >
          {{ loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Item' : 'Create Item') }}
        </ElButton>
      </div>
    </template>
  </el-drawer>
</template>

<script lang="ts" setup>
import { getCurrentInstance, ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { genFileId, UploadInstance, UploadProps, UploadRawFile } from "element-plus"
import { ItemRepository } from "../../persistent/repository/ItemRepository"

const props = defineProps<{
  isCreateItem: boolean
}>()

const emit = defineEmits<{
  'update:isCreateItem': [value: boolean]
}>()

const isCreateItem = computed({
  get: () => props.isCreateItem,
  set: (value: boolean) => emit('update:isCreateItem', value)
})
const internalInstance = getCurrentInstance()
const itemFormRef = ref()

let item = reactive({
  ItemId: null as number | null,
  Name: '',
  Description: '',
  Type: '',
  CreatedOn: null as Date | null,
  Image: null as string | null
})

let types = ref(ItemRepository.TYPES)
let loading = ref(false)
let isEditing = ref(false)
let editingItem = ref(null)

const uploadRef = ref<UploadInstance>()

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

const rules = {
  Name: [
    { required: true, message: 'Please enter item name', trigger: 'blur' },
    { min: 2, message: 'Name must be at least 2 characters', trigger: 'blur' }
  ],
  Type: [
    { required: true, message: 'Please select item type', trigger: 'change' }
  ]
}

const handleExceed: UploadProps['onExceed'] = (files) => {
  uploadRef.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  uploadRef.value!.handleStart(file)
}

const handleFileChange = (file: any) => {
  if (file.raw) {
    const reader = new FileReader()
    reader.onload = (e) => {
      item.Image = e.target?.result as string
    }
    reader.readAsDataURL(file.raw)
  }
}

const createItem = async () => {
  if (!itemFormRef.value) return
  
  try {
    await itemFormRef.value.validate()
    loading.value = true
    
    const theItem = {
      Name: item.Name,
      Description: item.Description || '',
      Type: item.Type,
      CreatedOn: new Date(),
      Image: item.Image || ''
    }
    
    await internalInstance?.appContext.config.globalProperties.$command.Item.add(theItem)
    
    ElMessage.success('Item created successfully!')
    resetForm()
    closeDrawer()
    internalInstance?.emit('onCreate')
    
  } catch (error) {
    console.error('Error creating item:', error)
    ElMessage.error('Failed to create item')
  } finally {
    loading.value = false
  }
}

const updateItem = async () => {
  if (!itemFormRef.value) return
  
  try {
    await itemFormRef.value.validate()
    loading.value = true
    
    const theItem = {
      ItemId: item.ItemId,
      Name: item.Name,
      Description: item.Description || '',
      Type: item.Type,
      CreatedOn: item.CreatedOn,
      Image: item.Image || ''
    }
    
    await internalInstance?.appContext.config.globalProperties.$command.Item.updateItem(theItem)
    
    ElMessage.success('Item updated successfully!')
    resetForm()
    closeDrawer()
    internalInstance?.emit('onCreate')
    
  } catch (error) {
    console.error('Error updating item:', error)
    ElMessage.error('Failed to update item')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  item.ItemId = null
  item.Name = ''
  item.Description = ''
  item.Type = ''
  item.Image = null
  item.CreatedOn = null
  isEditing.value = false
  editingItem.value = null
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

const closeDrawer = () => {
  resetForm()
  isCreateItem.value = false
}

// Function to set up editing mode
const setupEditMode = (itemToEdit: any) => {
  isEditing.value = true
  editingItem.value = itemToEdit
  item.ItemId = itemToEdit.ItemId
  item.Name = itemToEdit.Name
  item.Description = itemToEdit.Description || ''
  item.Type = itemToEdit.Type
  item.Image = itemToEdit.Image || null
  item.CreatedOn = itemToEdit.CreatedOn
}

// Watch for drawer visibility changes to apply dark mode
watch(isCreateItem, (newVisible) => {
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

// Expose functions for parent components
defineExpose({
  setupEditMode
})
</script>

<style lang="scss" scoped>
@import 'src/assets/scss/components/item/_item-drawer.scss';
</style>
