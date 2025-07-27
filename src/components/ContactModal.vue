<template>
  <div v-if="isVisible" class="contact-modal-overlay" @click="closeModal">
    <div class="contact-modal" @click.stop>
      <div class="contact-modal-header">
        <h2>{{ t('contact.send_message') }}</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>
      
      <form class="contact-form" @submit.prevent="sendEmail">
        <!-- Eliminado campo de asunto -->
        <div class="form-group">
          <label for="message">{{ t('contact.message_label') }}</label>
          <textarea 
            id="message"
            v-model="formData.message" 
            required 
            :placeholder="t('contact.message_placeholder')"
            rows="6"
          ></textarea>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="closeModal">
            {{ t('contact.cancel') }}
          </button>
          <button type="submit" class="btn-send" :disabled="loading">
            <span v-if="loading">{{ t('contact.sending') }}</span>
            <span v-else>{{ t('contact.send') }}</span>
          </button>
        </div>
      </form>
      
      <!-- Mensaje de éxito/error -->
      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import axios from 'axios'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  isVisible: boolean
}>()

const emit = defineEmits<{
  'close': []
}>()

const API_URL = import.meta.env.VITE_API_URL
const loading = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const formData = reactive({
  message: ''
})

function closeModal() {
  emit('close')
  resetForm()
}

function resetForm() {
  formData.message = ''
  message.value = ''
}

async function sendEmail() {
  loading.value = true
  message.value = ''
  
  try {
    const response = await axios.post(`${API_URL}/send-email`, { message: formData.message })
    
    if (response.data.success) {
      messageType.value = 'success'
      message.value = t('contact.success')
      resetForm()
      setTimeout(() => {
        closeModal()
      }, 2000)
    } else {
      messageType.value = 'error'
      message.value = response.data.error || t('contact.error')
    }
  } catch (error: any) {
    messageType.value = 'error'
    message.value = error.response?.data?.error || t('contact.connection_error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.contact-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.contact-modal {
  background: var(--color-bg);
  border-radius: 15px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 2px solid var(--color-presentacion);
}

.contact-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--color-presentacion);
}

.contact-modal-header h2 {
  color: var(--color-presentacion);
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-presentacion);
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.contact-info {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 4px solid var(--color-presentacion);
}

.contact-info p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  line-height: 1.4;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: var(--color-presentacion);
  font-weight: bold;
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea {
  padding: 0.8rem;
  border: 2px solid var(--color-presentacion);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-presentacion);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn-cancel,
.btn-send {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn-cancel {
  background: transparent;
  color: var(--color-presentacion);
  border: 2px solid var(--color-presentacion);
}

.btn-cancel:hover {
  background: var(--color-presentacion);
  color: var(--color-bg);
}

.btn-send {
  background: var(--color-presentacion);
  color: var(--color-bg);
}

.btn-send:hover:not(:disabled) {
  background: #e0e0e0;
  transform: translateY(-2px);
}

.btn-send:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  font-weight: bold;
  text-align: center;
}

.message.success {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  border: 1px solid #4caf50;
}

.message.error {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border: 1px solid #f44336;
}

/* Responsive */
@media (max-width: 768px) {
  .contact-modal {
    width: 95%;
    padding: 1.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn-cancel,
  .btn-send {
    width: 100%;
  }
}
</style> 