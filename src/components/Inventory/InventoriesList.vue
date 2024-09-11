<template>
  <ElRow :span="8" v-if="inventories.length === 0" :gutter="12">
    <ElCol style="boxShadow: --el-box-shadow;">
      <el-card shadow="hover">
        {{item === null ? "Create an item in order to unlock the inventory" : "Create an inventory in order to track your profits and losses"}}
      </el-card>
    </ElCol>
  </ElRow>
  <ElRow :span="8" v-for="inventory in inventories" :key="inventory.InventoryId" :gutter="12">
    <ElCol style="boxShadow: --el-box-shadow;">
      <el-card shadow="hover">
        {{inventory.Name}}<br>
        {{inventory.CreatedOn}}<br>
      </el-card>
    </ElCol>
  </ElRow>

  <ElButton @click="isCreateInventory = true" type="secondary">New</ElButton>
  <ElButton @click="getInventories" type="primary">Fetch</ElButton>

  <InventoryDrawer @onCreate="getInventories"/>
</template>

<script lang="ts" setup>
import {getCurrentInstance, onMounted, ref, provide} from 'vue'
import InventoryDrawer from "./InventoryDrawer.vue";

const isCreateInventory = ref(false)
provide('isCreateInventory', isCreateInventory)

const inventories = ref<Array<{ [key: string]: any }>>([]);
const item = ref<object | null>(null);
const internalInstance = getCurrentInstance();

const getInventories = async () => {
  inventories.value = await internalInstance?.appContext.config.globalProperties.$command.Inventory.list(3, 'desc')
  isCreateInventory.value = false
};

const getItem = async () => {
  const existing = await internalInstance?.appContext.config.globalProperties.$command.Item.getOne()
  if (!existing) {
    item.value = null
    return
  }
  item.value = existing
};

onMounted(async () => {
  await getInventories();
  await getItem();
});
</script>

<style scoped>

</style>
