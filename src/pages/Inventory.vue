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
  background-color: #f5f7fa;
}

.dark .inventory-page {
  background-color: #0f172a;
}
</style>

