<template>
  <div class="min-h-screen bg-base-200" data-theme="corporate">
    <AppHeader />
    <main class="container mx-auto px-4 py-8">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
</script>
