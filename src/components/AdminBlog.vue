<template>
  <div class="admin-blog-overlay">
    <div v-if="!hasAccess" class="modal-backdrop">
      <div class="modal">
        <h3>Acceso restringido</h3>
        <p>Ingresa la clave de administración para continuar:</p>
        <input v-model="inputKey" type="password" placeholder="API Key" class="modal-input" @keyup.enter="checkKey" />
        <button @click="checkKey" class="modal-btn">Acceder</button>
        <div v-if="error" class="modal-error">Clave incorrecta</div>
      </div>
    </div>
    <template v-else>
      <h2>Administración Blog</h2>
      <div class="blog-admin-forms">
        <form class="blog-form" @submit.prevent="createCategory">
          <label>Nueva categoría:</label>
          <input v-model="newCategoryName" placeholder="Nombre" required />
          <input v-model="newCategoryColor" type="color" title="Color" />
          <button type="submit" :disabled="loadingCat">Crear</button>
        </form>
        <div class="category-list-admin">
          <div v-for="cat in categories" :key="cat.name" class="category-admin-item">
            <template v-if="editingCategory && editingCategory.name === cat.name">
              <form class="edit-category-form" @submit.prevent="saveEditCategory(cat)">
                <input v-model="editCategoryName" placeholder="Nombre" required />
                <input v-model="editCategoryColor" type="color" title="Color" />
                <button type="submit" :disabled="loadingEditCat">Guardar</button>
                <button type="button" @click="cancelEditCategory" :disabled="loadingEditCat">Cancelar</button>
              </form>
            </template>
            <template v-else>
              <span class="category-color-dot" :style="{background: cat.color}"></span>
              <span>{{ cat.name }}</span>
              <button @click="startEditCategory(cat)">Editar</button>
              <button @click="deleteCategory(cat)" :disabled="loadingDeleteCat">Eliminar</button>
            </template>
          </div>
        </div>
        <form class="blog-form" @submit.prevent="createPost">
          <label>Nuevo post:</label>
          <input v-model="newPostTitle" placeholder="Título" required />
          <div class="icon-input-container">
            <input v-model="newPostImage" placeholder="Clase de icono Font Awesome (ej: fa-brands fa-python)" required />
            <i v-if="newPostImage" :class="newPostImage + ' icon-preview'" aria-hidden="true"></i>
          </div>
          <input v-model="newPostDescription" placeholder="Descripción" required />
          <select v-model="newPostCategory" required>
            <option value="" disabled>Selecciona categoría</option>
            <option v-for="cat in categories" :key="cat.name" :value="cat.name">{{ cat.name }}</option>
          </select>
          <textarea v-model="newPostHtml" placeholder="Contenido HTML" rows="2" required></textarea>
          <button type="submit" :disabled="loadingPost">Crear</button>
        </form>
      </div>
      <div class="blog-post-list">
        <div v-for="post in posts" :key="post.title + post.created_at" class="blog-post-item">
          <img v-if="post.image" :src="post.image" class="blog-post-img" />
          <div class="blog-post-content">
            <template v-if="editingPost && editingPost.title === post.title && editingPost.created_at === post.created_at">
              <form v-if="editingPost && editingPost.title === post.title && editingPost.created_at === post.created_at" class="edit-post-form" @submit.prevent="saveEditPost(post)">
                <input v-model="editPostTitle" placeholder="Título" required />
                <div class="icon-input-container">
                  <input v-model="editPostImage" placeholder="Clase de icono Font Awesome (ej: fa-brands fa-python)" required />
                  <i v-if="editPostImage" :class="editPostImage + ' icon-preview'" aria-hidden="true"></i>
                </div>
                <input v-model="editPostDescription" placeholder="Descripción" required />
                <select v-model="editPostCategory" required>
                  <option value="" disabled>Selecciona categoría</option>
                  <option v-for="cat in categories" :key="cat.name" :value="cat.name">{{ cat.name }}</option>
                </select>
                <textarea v-model="editPostHtml" placeholder="Contenido HTML" rows="2" required></textarea>
                <button type="submit" :disabled="loadingEdit">Guardar</button>
                <button type="button" @click="cancelEdit" :disabled="loadingEdit">Cancelar</button>
              </form>
            </template>
            <template v-else>
              <h3>{{ post.title }}</h3>
              <div class="blog-post-meta">
                <span class="blog-post-category" :style="{background: getCategoryColor(post.category)}">{{ post.category }}</span>
                <span class="blog-post-date">{{ formatDate(post.created_at) }}</span>
              </div>
              <p>{{ post.description }}</p>
              <div class="blog-post-actions">
                <button @click="startEditPost(post)">Editar</button>
                <button @click="deletePost(post)" :disabled="loadingDelete">Eliminar</button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL

const categories = ref<{name: string, color: string}[]>([])
const posts = ref<any[]>([])
const loading = ref(false)

// Categoría
const newCategoryName = ref('')
const newCategoryColor = ref('#888888')
const loadingCat = ref(false)
const editingCategory = ref<any|null>(null)
const editCategoryName = ref('')
const editCategoryColor = ref('#888888')
const loadingEditCat = ref(false)
const loadingDeleteCat = ref(false)

// Post
const newPostTitle = ref('')
const newPostImage = ref('')
const newPostDescription = ref('')
const newPostCategory = ref('')
const newPostHtml = ref('')
const loadingPost = ref(false)
const uploadingImage = ref(false)
const editingPost = ref<any|null>(null)
const editPostTitle = ref('')
const editPostImage = ref('')
const editPostDescription = ref('')
const editPostCategory = ref('')
const editPostHtml = ref('')
const loadingEdit = ref(false)
const loadingDelete = ref(false)

const API_KEY_SESSION = 'admin_api_key'
const inputKey = ref('')
const hasAccess = ref(false)
const error = ref(false)
const imageInput = ref<HTMLInputElement | null>(null)

function getApiKeyHeader() {
  const key = sessionStorage.getItem(API_KEY_SESSION)
  return key ? { 'x-api-key': key } : {}
}

async function fetchCategories() {
  try {
    const res = await axios.get(`${API_URL}/blog/categories`, { headers: getApiKeyHeader() })
    categories.value = res.data
  } catch {}
}

async function fetchPosts() {
  loading.value = true
  try {
    const res = await axios.get(`${API_URL}/blog/posts`, { headers: getApiKeyHeader() })
    posts.value = res.data
  } catch {
    posts.value = []
  } finally {
    loading.value = false
  }
}

async function createCategory() {
  if (!newCategoryName.value) return
  loadingCat.value = true
  try {
    await axios.post(`${API_URL}/blog/categories`, {
      name: newCategoryName.value,
      color: newCategoryColor.value
    }, { headers: getApiKeyHeader() })
    newCategoryName.value = ''
    newCategoryColor.value = '#888888'
    await fetchCategories()
  } catch (e: any) {
    alert(e?.response?.data?.error || 'Error al crear categoría')
  } finally {
    loadingCat.value = false
  }
}

function startEditCategory(cat: any) {
  editingCategory.value = cat
  editCategoryName.value = cat.name
  editCategoryColor.value = cat.color
}

function cancelEditCategory() {
  editingCategory.value = null
}

async function saveEditCategory(cat: any) {
  loadingEditCat.value = true
  try {
    await axios.put(`${API_URL}/blog/categories`, {
      name: cat.name,
      update: {
        name: editCategoryName.value,
        color: editCategoryColor.value
      }
    }, { headers: getApiKeyHeader() })
    editingCategory.value = null
    await fetchCategories()
  } catch (e: any) {
    alert(e?.response?.data?.error || 'Error al editar categoría')
  } finally {
    loadingEditCat.value = false
  }
}

async function deleteCategory(cat: any) {
  if (!confirm('¿Seguro que deseas eliminar esta categoría?')) return
  loadingDeleteCat.value = true
  try {
    await axios.delete(`${API_URL}/blog/categories`, {
      data: { name: cat.name },
      headers: getApiKeyHeader()
    })
    await fetchCategories()
  } catch (e: any) {
    alert(e?.response?.data?.error || 'Error al eliminar categoría')
  } finally {
    loadingDeleteCat.value = false
  }
}

async function createPost() {
  if (!newPostTitle.value || !newPostCategory.value || !newPostDescription.value || !newPostHtml.value) return
  loadingPost.value = true
  try {
    await axios.post(`${API_URL}/blog/posts`, {
      title: newPostTitle.value,
      image: newPostImage.value,
      description: newPostDescription.value,
      category: newPostCategory.value,
      html: newPostHtml.value
    }, { headers: getApiKeyHeader() })
    newPostTitle.value = ''
    newPostImage.value = ''
    newPostDescription.value = ''
    newPostCategory.value = ''
    newPostHtml.value = ''
    await fetchPosts()
  } catch (e: any) {
    alert(e?.response?.data?.error || 'Error al crear post')
  } finally {
    loadingPost.value = false
  }
}

async function handleImageUpload(event: any) {
  const file = event.target.files[0]
  if (!file) return
  
  uploadingImage.value = true
  try {
    const formData = new FormData()
    formData.append('image', file)
    
    const res = await axios.post(`${API_URL}/blog/upload-image`, formData, {
      headers: {
        ...getApiKeyHeader(),
        'Content-Type': 'multipart/form-data'
      }
    })
    
    newPostImage.value = res.data.url
    alert('Imagen subida correctamente')
  } catch (e: any) {
    alert(e?.response?.data?.error || 'Error al subir imagen')
  } finally {
    uploadingImage.value = false
  }
}

function startEditPost(post: any) {
  editingPost.value = post
  editPostTitle.value = post.title
  editPostImage.value = post.image
  editPostDescription.value = post.description
  editPostCategory.value = post.category
  editPostHtml.value = post.html || ''
}

function cancelEdit() {
  editingPost.value = null
}

async function saveEditPost(post: any) {
  loadingEdit.value = true
  try {
    await axios.put(`${API_URL}/blog/posts`, {
      title: post.title,
      created_at: post.created_at,
      update: {
        title: editPostTitle.value,
        image: editPostImage.value,
        description: editPostDescription.value,
        category: editPostCategory.value,
        html: editPostHtml.value
      }
    }, { headers: getApiKeyHeader() })
    editingPost.value = null
    await fetchPosts()
  } catch (e: any) {
    alert(e?.response?.data?.error || 'Error al editar post')
  } finally {
    loadingEdit.value = false
  }
}

async function deletePost(post: any) {
  if (!confirm('¿Seguro que deseas eliminar este post?')) return
  loadingDelete.value = true
  try {
    await axios.delete(`${API_URL}/blog/posts`, {
      data: {
        title: post.title,
        created_at: post.created_at
      },
      headers: getApiKeyHeader()
    })
    await fetchPosts()
  } catch (e: any) {
    alert(e?.response?.data?.error || 'Error al eliminar post')
  } finally {
    loadingDelete.value = false
  }
}

function getCategoryColor(cat: string) {
  const c = categories.value.find(x => x.name === cat)
  return c ? c.color : '#eee'
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString()
}

onMounted(() => {
  fetchCategories()
  fetchPosts()
  
  const stored = sessionStorage.getItem(API_KEY_SESSION)
  if (stored) {
    hasAccess.value = true
  }
})

function checkKey() {
  // Aquí podrías validar contra una key real, por ahora solo que no esté vacía
  if (inputKey.value.trim().length > 0) {
    sessionStorage.setItem(API_KEY_SESSION, inputKey.value.trim())
    hasAccess.value = true
    error.value = false
  } else {
    error.value = true
  }
}

function triggerImageInput() {
  imageInput.value?.click()
}
</script>

<style scoped>
.admin-blog-overlay {
  width: 100%;
  height: 100%;
  background: rgba(255,255,255,0.95);
  color: #222;
  padding: 2em;
  box-sizing: border-box;
  overflow-y: auto;
}
/* Reutiliza los estilos de BlogOverlay para formularios y listas */
.blog-admin-forms {
  display: block;
  gap: 2em;
  margin-bottom: 2em;
}
.blog-form {
  display: grid;
  gap: 0.8em;
  align-items: center;
  background: #f7f7f7;
  padding: 1em;
  border-radius: 1em;
}
.blog-form label {
  font-weight: bold;
}
.blog-form input, .blog-form select, .blog-form textarea {
  padding: 0.4em 0.8em;
  border-radius: 0.5em;
  border: 1px solid #ccc;
}
.blog-form button {
  padding: 0.4em 1em;
  border-radius: 0.5em;
  border: none;
  background: #3498db;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.blog-form button:disabled {
  background: #b1c2d5;
  cursor: not-allowed;
}

.image-upload-container {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.image-upload-input {
  display: none;
}

.upload-btn {
  padding: 0.4em 1em;
  border-radius: 0.5em;
  border: none;
  background: #27ae60;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.upload-btn:hover {
  background: #229954;
}

.image-preview {
  font-size: 0.8em;
  color: #666;
  font-style: italic;
}
.category-list-admin {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  margin-bottom: 1em;
}
.category-admin-item {
  display: flex;
  align-items: center;
  gap: 0.5em;
  background: #f0f0f0;
  padding: 0.5em 1em;
  border-radius: 0.7em;
}
.category-color-dot {
  width: 1.2em;
  height: 1.2em;
  border-radius: 50%;
  display: inline-block;
  margin-right: 0.5em;
}
.edit-category-form {
  display: flex;
  gap: 0.5em;
  align-items: center;
}
.blog-post-list {
  display: flex;
  flex-direction: column;
  gap: 2em;
}
.blog-post-item {
  display: flex;
  gap: 2em;
  background: #fff;
  border-radius: 1em;
  box-shadow: 0 2px 8px #0001;
  padding: 1.5em;
  align-items: flex-start;
}
.blog-post-img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 1em;
  background: #eee;
}
.blog-post-content {
  flex: 1;
}
.blog-post-meta {
  display: flex;
  gap: 1em;
  font-size: 0.9em;
  margin-bottom: 0.5em;
  align-items: center;
}
.blog-post-category {
  padding: 0.2em 0.8em;
  border-radius: 1em;
  color: #fff;
  font-weight: bold;
  font-size: 0.9em;
}
.blog-post-date {
  color: #888;
  font-size: 0.9em;
}
.edit-post-form {
  display: flex;
  gap: 0.5em;
  align-items: center;
  background: #f0f0f0;
  padding: 1em;
  border-radius: 1em;
  margin-bottom: 1em;
}
.blog-post-actions {
  display: flex;
  gap: 1em;
  margin-top: 1em;
}
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: #fff;
  border-radius: 1em;
  padding: 2em 2.5em;
  box-shadow: 0 2px 16px #0003;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 320px;
}
.modal-input {
  margin: 1em 0;
  padding: 0.7em 1em;
  border-radius: 1.5em;
  border: 1px solid #b1c2d5;
  font-size: 1.1em;
  width: 100%;
}
.modal-btn {
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 1.5em;
  padding: 0.7em 2em;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 0.5em;
}
.modal-error {
  color: #e74c3c;
  margin-top: 0.5em;
  font-size: 1em;
}
.icon-input-container {
  display: flex;
  align-items: center;
  gap: 0.7em;
}
.icon-preview {
  font-size: 2em;
  color: var(--color-light-gold);
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 