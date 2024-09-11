<template>
  <ElMenu
      class="el-menu-demo"
      mode="horizontal"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      style="position:fixed; left: 0; bottom: 0; width: 100%; z-index: 1000;"
      :ellipsis="false"
  >
    <ElMenuItem index="1">Dashboard</ElMenuItem>
    <ElMenuItem index="2">Inventory</ElMenuItem>
    <ElMenuItem index="3">Item</ElMenuItem>
    <ElMenuItem index="4" @click="logOut">Logout</ElMenuItem>
  </ElMenu>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { getCurrentInstance } from 'vue'

const router = useRouter();
const internalInstance = getCurrentInstance();

const logOut = async () => {
  let configuration = await internalInstance?.appContext.config.globalProperties.$command.Configuration.getOne();
  console.log(configuration);
  if (!configuration) {
    return
  }
  console.log('updating pin');
  await internalInstance?.appContext.config.globalProperties.$command.Configuration
      .updatePin(configuration.ConfigurationId, '')
      .then(async () => {
        window.location.reload();
      })
      .catch((error: any) => {
        console.error('Error updating pin:', error);
      });
}
</script>

<style scoped>

</style>
