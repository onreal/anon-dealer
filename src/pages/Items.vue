<template>
  <div class="items-page">
    <ItemsList />
  </div>
</template>

<script>
import ItemsList from '../components/Item/ItemsList.vue'

export default {
  name: "Items",
  components: {
    ItemsList
  }
}
</script>

<style scoped>
.items-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}
</style>
