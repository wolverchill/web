<template>
  <div class="logo-center logo-scale">
      <img src="/src/assets/images/logoed.png" alt="Logo" class="logo-image">
  </div>
</template>

<script setup lang="ts">


</script> 

<style scoped>
.logo-center {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo-image {
  width: 30%;
  height: 30%;
  object-fit: contain;
  filter: drop-shadow(0 0 10px var(--color-light-gold));
  border-radius:50%;
}
.logo-scale {
  transform: scale(0.5);
  transform-origin: center center;
}
</style> 