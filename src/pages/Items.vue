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
  background-color: #f5f7fa;
}

.dark .items-page {
  background-color: #0f172a;
}
</style>

