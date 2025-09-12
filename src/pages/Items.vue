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

<style lang="scss" scoped>
@import 'src/assets/scss/pages/_items.scss';
</style>

