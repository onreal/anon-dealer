<template>
  <InventoriesList/>
  <ItemsList/>
</template>

<script>
import {router} from "@/router";
import InventoriesList from "@/components/Inventory/InventoriesList.vue";
import ItemsList from "@/components/Item/ItemsList.vue";
export default {
  name: "DashboardComponent",
  components: {ItemsList, InventoriesList},
  data() {
    return {
      sheets: [],
    }
  },
  methods: {

  }
}
</script>

<style scoped>

</style>
