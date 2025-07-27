<script setup lang="ts">
import NavBar from './components/NavBar.vue'
import ThreeDScene from './components/ThreeDScene.vue'
import FooterBar from './components/FooterBar.vue'
</script>

<template>
  <div id="app">
    <header>
      <NavBar />
    </header>
    <main style="position: relative; width: 100vw; height: 100vh; overflow: hidden;">
      <ThreeDScene />
      <router-view class="overlay-absolute" />
    </main>
    <footer>
      <FooterBar />
    </footer>
  </div>
</template>

<style scoped>
#app {
  background: var(--color-bg);
  width: 100vw;
  height: 100vh;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

main {
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  position: relative;
  display: flex;
}

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
