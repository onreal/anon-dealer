<template>
  <el-drawer v-model="isCreateItem" direction="btt" :append-to-body="true" size="80%">
    <template #header>
      Create new item1
    </template>
    <template #default>
      <ElForm
          type="form"
          label-position="top"
      >
        <ElFormItem label="Item name">
          <ElInput v-model="item.Name" @keydown.enter.prevent="createItem"></ElInput>
        </ElFormItem>

        <ElUpload
            ref="uploadRef"
            v-model="item.Image"
            :limit="1"
            :on-exceed="handleExceed"
            :auto-upload="false"
        >
          <template #trigger>
            <el-button type="primary">select file</el-button>
          </template>
          <el-button class="ml-3" type="success" @click="">
            upload to server
          </el-button>
          <template #tip>
            <div class="el-upload__tip text-red">
              limit 1 file, new file will cover the old file
            </div>
          </template>
        </ElUpload>

        <ElFormItem label="Item description">
          <ElInput v-model="item.Description" type="textarea" @keydown.enter.prevent="createItem"></ElInput>
        </ElFormItem>

        <ElSelect
            v-model="item.Type"
            placeholder="Select"
            size="large"
            style="width: 240px"
        >
          <el-option
              v-for="(item, key) in types"
              :key="key"
              :label="item"
              :value="item"
          />
        </ElSelect>
        <ElFormItem label="Item type">
          <ElText v-model="item.Type" @keydown.enter.prevent="createItem"></ElText>
        </ElFormItem>
      </ElForm>
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="isCreateItem = false">close</el-button>
        <el-button :disabled="item.Name === '' || item.Name === null" type="primary" @click="createItem">create</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script lang="ts" setup>
import { getCurrentInstance, ref, inject } from 'vue'
import {genFileId, UploadInstance, UploadProps, UploadRawFile} from "element-plus";
import {ItemRepository} from "../../persistent/repository/ItemRepository";

const isCreateItem = inject('isCreateItem') as ReturnType<typeof ref>
const internalInstance = getCurrentInstance();
let item = ref({
  Name: null as string | null,
  Description: null as string | null,
  Type: null as string | null,
  CreatedOn: null as Date | null,
  Image: null as string | null
})

let types = ref(ItemRepository.TYPES)

const uploadRef = ref<UploadInstance>()

const handleExceed: UploadProps['onExceed'] = (files) => {
  uploadRef.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  uploadRef.value!.handleStart(file)
}
const createItem = async () => {
  if (item.value.Name === null) {
    return
  }
  const theItem = JSON.parse(JSON.stringify(item.value))
  theItem.CreatedOn = new Date().toISOString()
  theItem.Image = uploadRef.value
  console.log(uploadRef)
  await internalInstance?.appContext.config.globalProperties.$command.Item.add(theItem)
  item.value.Name = null
  internalInstance?.emit('onCreate');
}
</script>

<style scoped>

</style>
