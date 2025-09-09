<template>
  <div class="inventory-page">
    <InventoriesList />
  </div>
</template>

<script>
import InventoriesList from '../components/Inventory/InventoriesList.vue'

export default {
  name: "Inventory",
  components: {
    InventoriesList
  }
}
</script>

<style scoped>
.inventory-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}
</style>

