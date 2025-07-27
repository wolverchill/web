<template>
  <ChatIAOverlay class="overlay-absolute" />
</template>

<script setup lang="ts">
import ChatIAOverlay from '../components/ChatIAOverlay.vue'
</script>

<style scoped>
.overlay-absolute {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;
  pointer-events: auto;
}
</style> 