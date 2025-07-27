<template>
  <div class="home">
    <ThreeDScene />
    <OverlayContent />
  </div>
</template>

<script setup lang="ts">
import ThreeDScene from '@/components/ThreeDScene.vue'
import OverlayContent from '@/components/OverlayContent.vue'
</script>

<style scoped>
.home {
  width: 100%;
  height: 100vh;
  position: relative;
}
</style>
