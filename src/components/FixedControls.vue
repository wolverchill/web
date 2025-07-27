<template>
  <div class="fixed-controls-container">
    <!-- Controles del Blog -->
    <div v-if="type === 'blog'" class="blogia-controls-fixed">
      <div class="blogia-multiselect-container">
        <div class="blogia-multiselect" @click="toggleMultiselect">
          <span class="blogia-multiselect-text">
            {{ selectedCategories.length > 0 ? `${selectedCategories.length} categoría(s) seleccionada(s)` : 'Todas las categorías' }}
          </span>
          <span class="blogia-multiselect-arrow">▼</span>
        </div>
        <div v-if="isMultiselectOpen" class="blogia-multiselect-dropdown">
          <label class="blogia-multiselect-option">
            <input 
              type="checkbox" 
              :checked="selectedCategories.length === 0"
              @change="toggleAllCategories"
            />
            <span>Todas las categorías</span>
          </label>
          <label 
            v-for="cat in categories" 
            :key="cat.name" 
            class="blogia-multiselect-option"
          >
            <input 
              type="checkbox" 
              :value="cat.name"
              v-model="selectedCategories"
              @change="handleCategoryChange"
            />
            <span>{{ cat.name }}</span>
          </label>
        </div>
      </div>
      <input v-model="searchText" placeholder="Buscar posts..." class="blogia-input" />
      <button class="blogia-btn" @click="fetchPosts" :disabled="loading">Buscar</button>
    </div>

    <!-- Controles del Chat -->
    <div v-if="type === 'chat'" class="chat-controls-fixed">
      <input v-model="inputValue" class="chat-input" placeholder="Escribe tu pregunta..." />
      <button class="chat-btn" @click="sendRequest" :disabled="loading || !inputValue.trim()">Enviar</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { useCategoriesStore } from '@/stores/categories'

const props = defineProps<{
  type: 'blog' | 'chat'
}>()

const emit = defineEmits<{
  'posts-loaded': [posts: any[]]
  'categories-loaded': [categories: any[]]
  'chat-response': [response: any]
}>()

const API_URL = import.meta.env.VITE_API_URL
const { setCategories } = useCategoriesStore()

// Variables para Blog
const categories = ref<{name: string, color: string}[]>([])
const selectedCategories = ref<string[]>([])
const searchText = ref('')
const loading = ref(false)
const isMultiselectOpen = ref(false)

// Variables para Chat
const inputValue = ref('')

// Funciones para Blog
async function fetchCategories() {
  try {   
    const res = await axios.get(`${API_URL}/blog/categories`)
    categories.value = res.data
    setCategories(res.data) // Actualizar el store
    emit('categories-loaded', res.data)
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

async function fetchPosts() {
  loading.value = true
  try {
    const body: any = { q: searchText.value }
    if (selectedCategories.value.length > 0) {
      body.categories = selectedCategories.value
    } else {
      body.categories = []
    }
    const res = await axios.post(`${API_URL}/blog/posts/search`, body)
    emit('posts-loaded', res.data)
  } catch {
    emit('posts-loaded', [])
  } finally {
    loading.value = false
  }
}

function toggleMultiselect() {
  isMultiselectOpen.value = !isMultiselectOpen.value
}

function toggleAllCategories() {
  if (selectedCategories.value.length === 0) {
    selectedCategories.value = categories.value.map(cat => cat.name)
  } else {
    selectedCategories.value = []
  }
}

function handleCategoryChange() {
  // Lógica para manejar cambios en categorías
}

// Funciones para Chat
async function sendRequest() {
  if (!inputValue.value.trim()) return
  loading.value = true
  try {
    const res = await axios.post(`${API_URL}/prompt`, {
      prompt: inputValue.value,
      lang: 'es'
    })
    emit('chat-response', res.data)
    inputValue.value = ''
  } catch (e: any) {
    const error = e as any
    if (error.response && error.response.status === 429) {
      emit('chat-response', { error: 'Se ha cumplido con el limite de peticiones, no puedo generarte una respuesta' })
    } else {
      emit('chat-response', { error: 'Error al procesar la solicitud' })
    }
  } finally {
    loading.value = false
  }
}

// Cerrar el multiselector cuando se hace clic fuera
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement
  if (!target.closest('.blogia-multiselect-container')) {
    isMultiselectOpen.value = false
  }
}

onMounted(() => {
  if (props.type === 'blog') {
    fetchCategories()
    fetchPosts()
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.fixed-controls-container {
  position: fixed;
  top: var(--menu-height);
  left: 0;
  right: 0;
  z-index: 999;
  background: var(--color-bg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top: 0;
  transform: translateY(0);
}

/* Estilos para controles del Blog */
.blogia-controls-fixed {
  display: flex;
  align-items: center;
  gap: var(--search-controls-gap);
  padding: var(--search-controls-padding);
  height: var(--search-controls-height);
}

.blogia-multiselect-container {
  position: relative;
  min-width: 200px;
}

.blogia-multiselect {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--input-padding);
  border-radius: var(--input-border-radius);
  background: transparent;
  color: var(--color-light);
  cursor: pointer;
  font-weight: bold;
  border: var(--input-border);
  outline: none;
  transition: var(--input-transition);
  font-size: var(--font-normal);
}

.blogia-multiselect:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--color-light-gold);
  transform: translateY(-2px);
}

.blogia-multiselect-text {
  flex: 1;
  text-align: left;
}

.blogia-multiselect-arrow {
  margin-left: 0.5em;
  transition: transform 0.3s ease;
  font-size: 0.8em;
}

.blogia-multiselect-container:hover .blogia-multiselect-arrow {
  transform: rotate(180deg);
}

.blogia-multiselect-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-bg);
  border: 2px solid var(--color-light-gold);
  border-radius: 1em;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  overflow-y: auto;
  margin-top: 0.5em;
}

.blogia-multiselect-option {
  display: flex;
  align-items: center;
  padding: 0.8em 1.2em;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: var(--font-normal);
  color: var(--color-light);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.blogia-multiselect-option:last-child {
  border-bottom: none;
}

.blogia-multiselect-option:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-light-gold);
}

.blogia-multiselect-option input[type="checkbox"] {
  margin-right: 0.8em;
  cursor: pointer;
  accent-color: var(--color-light-gold);
}

.blogia-multiselect-option span {
  flex: 1;
  cursor: pointer;
}

.blogia-input {
  flex: 1;
  font-size: var(--font-blog-normal);
  padding: var(--input-padding);
  border-radius: var(--input-border-radius);
  font-weight: bold;
  outline: none;
  border: var(--input-border);
  background: transparent;
  color: var(--color-light);
  transition: var(--input-transition);
}

.blogia-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.blogia-input:focus {
  border-color: var(--color-light-gold);
  background: rgba(255, 255, 255, 0.05);
}

.blogia-btn {
  width: var(--button-width);
  font-size: var(--font-blog-normal);
  padding: var(--button-padding);
  border-radius: var(--button-border-radius);
  border: none;
  background: var(--color-light-gold);
  color: var(--color-bg);
  font-weight: bold;
  cursor: pointer;
  transition: var(--button-transition);
}

.blogia-btn:hover {
  background: #f39c12;
  transform: translateY(-2px);
}

.blogia-btn:disabled {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
  transform: none;
}

/* Estilos para controles del Chat */
.chat-controls-fixed {
  display: flex;
  align-items: center;
  gap: var(--search-controls-gap);
  padding: var(--search-controls-padding);
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
  background: transparent;
  color: var(--color-light);
  transition: var(--input-transition);
}

.chat-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.chat-input:focus {
  border-color: var(--color-light-gold);
  background: rgba(255, 255, 255, 0.05);
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

/* Responsive */
@media (max-width: 768px) {
  .blogia-controls-fixed,
  .chat-controls-fixed {
    flex-direction: column;
    gap: 0.8em;
    padding: 1em;
    height: auto;
  }
  
  .blogia-multiselect-container {
    min-width: 150px;
  }
  
  .blogia-multiselect,
  .chat-input {
    font-size: var(--font-mobile-normal);
    padding: 0.5em 0.8em;
  }
  
  .blogia-btn,
  .chat-btn {
    font-size: var(--font-mobile-normal);
    padding: 0.4em 0;
  }
}
</style> 