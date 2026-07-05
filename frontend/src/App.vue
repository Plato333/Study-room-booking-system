<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from './components/AppLayout.vue'
import AiChatView from './views/AiChatView.vue'
import { useUserStore } from './stores/user'

const route = useRoute()
const userStore = useUserStore()

onMounted(() => {
  userStore.restoreLoginState()
})
</script>

<template>
  <AppLayout v-if="route.path !== '/login'" />
  <router-view v-else />
  <AiChatView v-if="route.path !== '/login'" />
</template>
