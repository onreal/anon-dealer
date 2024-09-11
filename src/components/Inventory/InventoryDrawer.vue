<template>
  <el-drawer v-model="isCreateInventory" direction="btt" :append-to-body="true" size="80%">
    <template #header>
      Create new inventory
    </template>
    <template #default>



      <el-steps style="max-width: 600px" :active="active" finish-status="success">
        <el-step title="Basic info"></el-step>
        <el-step title="Buy"></el-step>
        <el-step title="Sell"></el-step>
      </el-steps>

      <ElForm
          type="form"
          label-position="top"
          v-if="active === 0"
      >
        <ElFormItem label="Name">
          <ElInput v-model="inventory.Name" type="text" @keydown.enter.prevent="createInventory"></ElInput>
        </ElFormItem>
        <ElFormItem label="Item">
          <el-select v-model="inventory.ItemId" placeholder="please select your zone">
            <el-option label="Zone one" value="shanghai" />
            <el-option label="Zone two" value="beijing" />
          </el-select>
        </ElFormItem>
      </ElForm>

      <ElForm
          type="form"
          label-position="top"
          v-if="active === 1"
      >
        <ElFormItem label="Amount (of this item you have for sale)">
          <el-input-number v-model="inventory.Amount" :min="1" size="large" type="number" @keydown.enter.prevent="createInventory"></el-input-number>
        </ElFormItem>
        <ElFormItem label="Cost (for overall amount)">
          <el-input-number v-model="inventory.Cost" :min="1" size="large" type="number" @keydown.enter.prevent="createInventory"></el-input-number>
        </ElFormItem>
      </ElForm>

      <ElForm
          type="form"
          label-position="top"
          v-if="active === 2"
      >
        <ElFormItem label="Cost per amount">
          <ElInput v-model="inventory.CostPerAmount" type="number" @keydown.enter.prevent="createInventory"></ElInput>
        </ElFormItem>
        <ElFormItem label="Amount for cost">
          <ElInput v-model="inventory.AmountForCost" type="number" @keydown.enter.prevent="createInventory"></ElInput>
        </ElFormItem>
        <ElFormItem label="Multiplier">
          <el-slider v-model="inventory.Multiplier" />
        </ElFormItem>
      </ElForm>
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="isCreateInventory = false">close</el-button>
        <el-button :disabled="inventory.Name === '' || inventory.Name === null" type="primary" @click="createInventory">create</el-button>
        <el-button style="margin-top: 12px" @click="next">Next step</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script lang="ts" setup>
import { getCurrentInstance, ref, inject } from 'vue'

const isCreateInventory = inject('isCreateInventory') as ReturnType<typeof ref>
const internalInstance = getCurrentInstance();
let inventory = ref({
  Name: null as string | null,
  ItemId: null as number | null,
  Amount: null as number | null,
  Cost: null as number | null,
  CostPerAmount: null as number | null,
  AmountForCost: null as number | null,
  Multiplier: null as number | null,
  CreatedOn: null as Date | null,
  ModifiedOn: null as Date | null,
})
const createInventory = async () => {
  if (inventory.value.Name === null) {
    return
  }
  const item = JSON.parse(JSON.stringify(inventory.value))
  item.CreatedOn = new Date()
  await internalInstance?.appContext.config.globalProperties.$command.Inventory.add(item)
  inventory.value.Name = null
  console.log('enter pressed')
  internalInstance?.emit('onCreate');
}

const active = ref(0)

const next = () => {
  if (active.value++ > 2) active.value = 0
}
</script>

<style scoped>

</style>
