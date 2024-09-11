<template>
  <ElContainer>
    <ElHeader>
          <img
              src="https://pro.formkit.com/logo.svg"
              alt="FormKit Logo"
              width="244"
              height="50"
              class="logo"
          >
    </ElHeader>
    <ElMain>
      <router-view />
    </ElMain>
    <ElFooter>
      Extend as you want this open source project
      <Navigation/>
    </ElFooter>
  </ElContainer>
</template>


<script setup lang="ts">
import Navigation from "./components/Nav/Navigation.vue";
</script>
