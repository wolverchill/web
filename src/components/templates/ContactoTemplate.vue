<template>
  <div class="contacto-template">
    <div class="contacto-row">
      <div class="contacto-item">
        <button class="contacto-btn" @click="onMailClick">
          <i class="fa-solid fa-envelope"></i>
        </button>
      </div>
      <div class="contacto-item">
        <a class="contacto-btn" href="https://www.linkedin.com/in/edward-gonzalez-60730771/" target="_blank" rel="noopener">
          <i class="fa-brands fa-linkedin"></i>
        </a>
      </div>
      <div class="contacto-item">
        <a class="contacto-btn" href="https://github.com/backend3v" target="_blank" rel="noopener">
          <i class="fa-brands fa-github"></i>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
function onMailClick() {
  // Función pendiente para enviar mail
  alert('Funcionalidad de envío de mail pendiente');
}
</script>

<style scoped>
.contacto-template {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.contacto-row {
  display: flex;
  flex-direction: row;
  gap: 1.2em;
  justify-content: center;
  width: 100%;
}
.contacto-item {
  display: flex;
  justify-content: center;
}
.contacto-btn {
  display: flex;
  align-items: center;
  gap: 0.6em;
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 2em;
  padding: 0.5em 0.5em;
  font-size: 0.7em;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  cursor: pointer;
  text-decoration: none;
  transition: background 0.2s;
}
.contacto-btn:hover {
  background: #217dbb;
  color: #fff;
}
.contacto-btn i {
  font-size: 1.2em;
}
</style> 