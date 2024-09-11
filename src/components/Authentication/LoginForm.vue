<template>
  <div>
    <ElForm
        type="form"
        label-position="top"
    >
      <ElFormItem v-if="error !== null" :label="$t('registration.pin')">
        Your data are safely encrypted and sleeping in your device. Please set your PIN first in order to unlock them!
      </ElFormItem>
      <ElFormItem :label="$t('registration.pin')">
        <ElInput v-model="pin"></ElInput>
      </ElFormItem>

      <ElFormItem>
        <ElButton type="primary" @click="submit">Login</ElButton>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<script>
// import { reactive, ref } from 'vue'
// import type { FormInstance, FormRules } from 'element-plus'
//
// const ruleFormRef = ref<FormInstance>()
// const ruleForm = reactive({
//   pin: '',
// })
// const validatePin = (rule: any, value: any, callback: any) => {
//   if (value === '') {
//     callback(new Error('Please input the password'))
//   } else {
//     if (ruleForm.pin !== '') {
//       if (!ruleFormRef.value) return
//       ruleFormRef.value.validateField('checkPass', () => null)
//     }
//     callback()
//   }
// }
// const rules = reactive<FormRules<typeof ruleForm>>({
//   pin: [{ validator: validatePin, trigger: 'blur' }],
// })


import {router} from "@/router";
export default {
  name: "LoginForm",
  data() {
    return {
      pin: null,
      error: null
    }
  },
  methods: {
    async submit () {
      this.error = null;
      if (this.pin === null || this.pin === '') {
        this.error = 'Please input the pin';
        return;
      }
      await this.updateConfigurationPin(this.pin.toString());
    },
    async updateConfigurationPin(pin) {
      let configuration = await this.$command.Configuration.getOne();
      if (!configuration) {
        return
      }
      await this.$command.Configuration.updatePin(configuration.ConfigurationId, pin).then(async () => {
        window.location.reload();
      }).catch(() => {
        this.error = 'Invalid pin';
      });
    }
  }
}
</script>

<style scoped>

</style>
