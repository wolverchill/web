<template>
  <div class="text-overlay">
    <div class="text-frame">
      <!-- Controles fijos fuera del área de scroll -->
      <FixedControls 
        type="chat" 
        @chat-response="handleChatResponse"
      />
      
      <div class="text-content" ref="textContentRef" style="overflow-y: auto;">
        <div ref="startMarkerRef" id="start-marker" style="height:1px;width:100%;margin-top:2%"></div>
        <div class="outputRequest">
          <div v-if="loading" class="spinner"></div>
          <template v-else-if="responseObj">
            <ChatIAResponse :data="responseObj" />
          </template>
          <div v-else-if="response">{{ response }}</div>
          <div v-else></div>
        </div>
        <div ref="endMarkerRef" id="end-marker" style="height:1px;width:100%;margin-bottom:15%"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useOverlayScroll } from '@/utils/useOverlayScroll'
import ChatIAResponse from './ChatIAResponse.vue'
import FixedControls from './FixedControls.vue'

const textContentRef = ref<HTMLElement | null>(null)
const startMarkerRef = ref<HTMLElement | null>(null)
const endMarkerRef = ref<HTMLElement | null>(null)
useOverlayScroll(textContentRef, startMarkerRef, endMarkerRef)

const response = ref<string|null>(null)
const responseObj = ref<any|null>(null)
const loading = ref(false)

// Método para manejar la respuesta del chat desde FixedControls
function handleChatResponse(data: any) {
  loading.value = false
  if (data.error) {
    response.value = data.error
    responseObj.value = null
  } else {
    if (typeof data === 'object' && data !== null) {
      responseObj.value = data
      response.value = null
    } else {
      response.value = data
      responseObj.value = null
    }
  }
}
</script>

<style scoped>
.chatia-overlay {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  font-size: 0.5em;
}
.inputChat {
  position: fixed;
  top: var(--menu-height);
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: var(--search-controls-gap);
  background: var(--color-bg);
  padding: var(--search-controls-padding);
  box-shadow: var(--search-controls-shadow);
  z-index: var(--search-controls-z-index);
  border-bottom: var(--search-controls-border);
  height: var(--search-controls-height);
}

.chat-input {
  flex: 1;
  font-size: var(--font-chat-normal);
  padding: var(--input-padding);
  border-radius: var(--input-border-radius);
  font-weight: bold;
  outline: none;
  border: var(--input-border);
  background: var(--color-light);
  color: var(--color-bg);
  transition: var(--input-transition);
}

.chat-input::placeholder {
  background: var(--color-light);
  color: var(--color-medium);
}

.chat-input:focus {
  border-color: var(--color-light-gold);
  background: var(--color-light);
  color: var(--color-medium);
}

.chat-btn {
  width: var(--button-width);
  font-size: var(--font-chat-normal);
  padding: var(--button-padding);
  border-radius: var(--button-border-radius);
  border: none;
  background: var(--color-light-gold);
  color: var(--color-bg);
  font-weight: bold;
  cursor: pointer;
  transition: var(--button-transition);
}

.chat-btn:hover {
  background: #f39c12;
  transform: translateY(-2px);
}

.chat-btn:disabled {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
  transform: none;
}

.outputRequest {
  margin-top: var(--content-margin-top);
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--content-padding);
  overflow-y: auto;
}
.spinner {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3498db;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: spin 1s linear infinite;
  margin: auto;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .inputChat {
    flex-direction: column;
    gap: 0.8em;
    padding: 1em;
    height: auto;
  }
  
  .chat-input {
    width: 100%;
    font-size: var(--font-mobile-normal);
  }
  
  .chat-btn {
    width: 100%;
    font-size: var(--font-mobile-normal);
  }
  
  .outputRequest {
    font-size: var(--font-mobile-title);
    padding: 1em;
  }
  
  .spinner {
    width: 2rem;
    height: 2rem;
  }
}

@media (max-width: 480px) {
  .inputChat {
    padding: 0.8em;
    gap: 0.6em;
  }
  
  .chat-input {
    font-size: 0.9em;
    padding: 0.5em 0.8em;
  }
  
  .chat-btn {
    font-size: 0.9em;
    padding: 0.4em 0;
  }
  
  .outputRequest {
    font-size: 1.2em;
    padding: 0.8em;
  }
  
  .spinner {
    width: 1.5rem;
    height: 1.5rem;
  }
}
</style> 