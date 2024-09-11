<template>
  <ElRow :span="8" v-if="items.length === 0" :gutter="12">
    <ElCol style="boxShadow: --el-box-shadow;">
      <el-card shadow="hover">
        Please create an item first.
      </el-card>
    </ElCol>
  </ElRow>
  <ElRow :span="8" v-for="item in items" :key="item.ItemId" :gutter="12">
    <ElCol style="boxShadow: --el-box-shadow;">
      <el-card shadow="hover">
        {{item.Name}}<br>
        {{item.CreatedOn}}<br>
      </el-card>
    </ElCol>
  </ElRow>

  <ElButton @click="isCreateItem = true" type="secondary">New</ElButton>
  <ElButton @click="getItems" type="primary">Fetch</ElButton>

  <ItemDrawer @onCreate="getItems"/>
</template>

<script lang="ts" setup>
import {getCurrentInstance, onMounted, ref, provide} from 'vue'
import ItemDrawer from "./ItemDrawer.vue";

const isCreateItem = ref(false)
provide('isCreateItem', isCreateItem)

const items = ref<Array<{ [key: string]: any }>>([]);
const internalInstance = getCurrentInstance();

const getItems = async () => {
  items.value = await internalInstance?.appContext.config.globalProperties.$command.Item.list(3, 'desc')
  isCreateItem.value = false
};

onMounted(getItems);
</script>

<style scoped>

</style>
