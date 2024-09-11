<template>
  <div>
    <ElForm
        type="form"
        :model="registration"
        label-position="top"
    >
      <ElFormItem :label="$t('registration.pin')">
        <ElInput v-model="registration.pin"></ElInput>
      </ElFormItem>

      <ElFormItem :label="$t('registration.country')">
        <ElSelect filterable v-model="registration.country" :placeholder="$t('registration.countryPlaceholder')">
          <ElOption v-for="(country, index) in countries" :key="index" :label="country.name + ' - ' + country.currency.symbol + ' / ' + country.currency.code" :value="country.code" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem :label="$t('registration.timezone')">
        <ElSelect filterable v-model="registration.timezone" :placeholder="$t('registration.timezonePlaceholder')">
          <ElOption v-for="(timezone, index) in getTimezones" :key="index" :label="timezone" :value="timezone" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem :label="$t('registration.questionTrade')">
        <ElSelect v-model="registration.profession" :placeholder="$t('registration.questionTradePlaceholder')">
          <ElOption v-for="(profession, index) in professions" :key="index" :label="profession.name" :value="profession.id" />
        </ElSelect>
      </ElFormItem>

      <p>
        {{$t('registration.privacyDisclaimer')}}
      </p>

      <ElFormItem :label="$t('registration.blackQuestion')">
        <ElRadioGroup v-model="registration.isAFriendOfMine">
          <ElRadio :label="false">{{$t('registration.no')}}</ElRadio>
          <ElRadio :label="true">{{$t('registration.yes')}}</ElRadio>
        </ElRadioGroup>
      </ElFormItem>

      <p v-if="registration.isAFriendOfMine">
        {{$t('registration.suggestBackend')}}
      </p>

      <ElFormItem :label="$t('registration.questionBackend')">
        <ElRadioGroup v-model="registration.isBackend">
          <ElRadio :label="false">{{$t('registration.no')}}</ElRadio>
          <ElRadio :label="true">{{$t('registration.yes')}}</ElRadio>
        </ElRadioGroup>
      </ElFormItem>

      <ElFormItem v-if="registration.isBackend" :label="$t('registration.backendUrl')">
        <ElInput :placeholder="$t('registration.backendUrlPlaceholder')" v-model="registration.backendUrl"></ElInput>
      </ElFormItem>

      <ElFormItem v-if="registration.isBackend" :label="$t('registration.backendToken')">
        <ElInput :placeholder="$t('registration.backendTokenPlaceholder')" v-model="registration.backendToken"></ElInput>
      </ElFormItem>

      <ElFormItem>
        <ElCheckbox :label="$t('registration.agree')" v-model="registration.isAgree"></ElCheckbox>
      </ElFormItem>

      <ElFormItem>
        <ElButton type="primary" @click="submit">Config</ElButton>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<script>
import {router} from "@/router";
import professions from '@/data/professions.json'
import countries from '@/data/countries.json'
import timezones from '@/data/timezones.json'

export default {
  name: "RegistrationForm",
  data() {
    return {
      sheets: [],
      registration: {
        pin: null,
        country: null,
        timezone: null,
        profession: null,
        isAFriendOfMine: false,
        isBackend: false,
        isAgree: false,
        backendUrl: null,
        backendToken: null
      },
      professions, countries, timezones
    }
  },
  methods: {
    async submit() {
      await new Promise(r => setTimeout(r, 1000))
      let configuration = await this.$command.Configuration.getOne();
      if (configuration) {
        return
      }

      localStorage.setItem('pin', this.registration.pin.toString());
      configuration = await this.$command.Configuration.add({
        Pin: this.registration.pin,
        State: 'REGISTERED',
        CreatedOn:  new Date(),
        LastLogin: new Date()
      })

      const country = await this.getCountry(this.registration.country)

      const settings = {
        IsBackend: this.registration.isBackend,
        ServerUrl: this.registration.backendUrl,
        ServerToken: this.registration.backendToken,
        Profession: this.registration.profession,
        IsAFriendOfMine: this.registration.isAFriendOfMine,
        Country: country.name,
        Currency: country.currency.code,
        Language: country.code,
        Timezone: this.registration.timezone,
        CreatedOn: new Date(),
        ModifiedOn: new Date()
      }

      await this.$command.Settings.add(settings)

      await router.push({name: 'Dashboard'})
    },
    async getCountry(code) {
      const country = await this.countries.filter((country) => {
        return country.code === code
      })[0]

      return JSON.parse(JSON.stringify(country));
    }
  },
  computed: {
    getTimezones() {
      this.registration.timezone = null
      return this.timezones[this.registration.country]
    }
  }
}
</script>

<script setup>

</script>

<style scoped>
</style>
