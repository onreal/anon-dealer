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

<style lang="scss" scoped>
@import 'src/assets/scss/pages/_inventory.scss';
</style>

