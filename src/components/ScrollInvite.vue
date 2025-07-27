<template>
  <div v-if="!hasScrolled" class="scroll-invite">
    <span class="arrow">&#8595;</span>
    <span class="text">Desliza para ver más</span>
  </div>
</template>

<script setup lang="ts">
import { hasScrolled } from '@/stores/hasScrolled'
</script>

<style scoped>
.scroll-invite {
  position: absolute;
  left: 50%;
  bottom: 2.5em;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
  pointer-events: none;
}
.arrow {
  font-size: 2em;
  animation: bounce 1.2s infinite;
  color: var(--color-white, #fff);
}
.text {
  font-size: 1em;
  color: var(--color-white, #fff);
  margin-top: 0.2em;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(10px); }
}
</style> 