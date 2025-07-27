<template>
  <div class="text-overlay">
    <div class="text-frame">
      <!-- Controles fijos fuera del área de scroll -->
      <FixedControls 
        type="blog" 
        @posts-loaded="handlePostsLoaded"
        @categories-loaded="handleCategoriesLoaded"
      />
      
      <div class="text-content" ref="textContentRef" style="overflow-y: auto;">
        <div ref="startMarkerRef" id="start-marker" style="height:1px;width:100%;margin-top:2%"></div>
        <div class="blogia-content">
          <div v-if="loading" class="blogia-spinner"></div>
          <div v-else-if="posts.length === 0" class="blogia-empty">No hay posts para mostrar.</div>
          <div v-else class="blogia-list" >
            <div v-for="post in posts" :key="post.title + post.created_at" class="blogia-item" :style="{color: 'white', borderColor: getCategoryColor(post.category)}" @click="openModal(post)">
              <i v-if="post.image" :class="post.image + ' blogia-img'" aria-hidden="true" :style="{ color: getCategoryColor(post.category)}"></i>
              <div class="blogia-info" :style="{color: getCategoryColor(post.category)}">
                {{ post.title }}
                <div class="blogia-meta">
                  <span class="blogia-category" :style="{background: getCategoryColor(post.category)}">{{ post.category }}</span>
                  <span class="blogia-date">{{ formatDate(post.created_at) }}</span>
                </div>
                <p class="blogia-desc">{{ post.description }}</p>
              </div>
            </div>
          </div>
        </div>
        <div ref="endMarkerRef" id="end-marker" style="height:1px;width:100%;margin-bottom:15%"></div>
      </div>
    </div>
    <!-- Modal para mostrar el HTML del post -->
    <div v-if="showModal" class="blog-modal-overlay" @click.self="closeModal">
      <div class="blog-modal blog-modal-fullwidth">
        <button class="blog-modal-close" @click="closeModal">&times;</button>
        <div class="blog-modal-content-html">
          <iframe
            v-if="selectedPost?.html"
            class="blog-html-iframe"
            :srcdoc="wrapHtml(selectedPost.html)"
            frameborder="0"
            width="100%"
            height="100%"
            style="min-height:60vh;"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useOverlayScroll } from '@/utils/useOverlayScroll'
import FixedControls from './FixedControls.vue'
import { useCategoriesStore } from '@/stores/categories'

const textContentRef = ref<HTMLElement | null>(null)
const startMarkerRef = ref<HTMLElement | null>(null)
const endMarkerRef = ref<HTMLElement | null>(null)
useOverlayScroll(textContentRef, startMarkerRef, endMarkerRef)

const posts = ref<any[]>([])
const loading = ref(false)
const { setCategories, getCategoryColor } = useCategoriesStore()

// Modal state
const showModal = ref(false)
const selectedPost = ref<any | null>(null)

function openModal(post: any) {
  selectedPost.value = post
  showModal.value = true
}
function closeModal() {
  showModal.value = false
  selectedPost.value = null
}

// Métodos para manejar eventos de FixedControls
function handlePostsLoaded(newPosts: any[]) {
  posts.value = newPosts
}

function handleCategoriesLoaded(newCategories: any[]) {
  setCategories(newCategories)
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString()
}

function wrapHtml(html: string) {
  return `
    <html>
      <head>
        <style>
          html, body { max-width: 100vw; overflow-x: hidden; }
          body { color: white; background: transparent; font-size: 1.1em; line-height: 1.6; margin: 0; padding: 2em 1em; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; }
          main { width: 100%; max-width: 800px; margin: 0 auto; box-sizing: border-box; }
          a { color: #f7dc6f; }
          pre { white-space: pre-wrap; position: relative; }
          code { background-color: #222; border: 1px solid #999; display: block; padding: 20px; border-radius: 8px; }
          .copy-btn, .download-btn {
            position: absolute;
            top: 8px;
            background: #f7dc6f; color: #222;
            border: none; border-radius: 5px;
            padding: 0.3em 0.8em; font-size: 0.95em; font-weight: bold;
            cursor: pointer; z-index: 2;
            transition: background 0.2s;
          }
          .copy-btn { right: 8px; }
          .download-btn { right: 90px; }
          .copy-btn:hover, .download-btn:hover { background: #ffe066; }
          .copied-msg {
            position: absolute; top: 8px; right: 170px;
            background: #222; color: #f7dc6f; padding: 0.2em 0.7em;
            border-radius: 5px; font-size: 0.9em; opacity: 0.95;
            pointer-events: none; z-index: 3;
            transition: opacity 0.3s;
          }
          ::-webkit-scrollbar { width: 10px; background: #222; }
          ::-webkit-scrollbar-thumb { background: #f7dc6f; border-radius: 5px; }
          ::selection { background: #f7dc6f33; }
        </style>
      </head>
      <body>
        <main>${html}</main>
        <script>
          document.querySelectorAll('pre > code').forEach(function(codeBlock) {
            var pre = codeBlock.parentElement;
            pre.style.position = 'relative';
            // Botón copiar (siempre)
            var btnCopy = document.createElement('button');
            btnCopy.innerText = 'Copiar';
            btnCopy.className = 'copy-btn';
            btnCopy.onclick = function(e) {
              e.stopPropagation();
              var text = codeBlock.innerText;
              navigator.clipboard.writeText(text);
              var msg = document.createElement('span');
              msg.className = 'copied-msg';
              msg.innerText = '¡Copiado!';
              pre.appendChild(msg);
              setTimeout(function() { pre.removeChild(msg); }, 1200);
            };
            pre.appendChild(btnCopy);
            // Botón descargar solo si tiene la clase 'download-code'
            if (codeBlock.classList.contains('download-code')) {
              var btnDownload = document.createElement('button');
              btnDownload.innerText = 'Descargar';
              btnDownload.className = 'download-btn';
              btnDownload.onclick = function(e) {
                e.stopPropagation();
                var text = codeBlock.innerText;
                var filename = codeBlock.getAttribute('data-filename');
                if (!filename) {
                  if (codeBlock.classList.contains('language-bash') || text.trim().startsWith('#!/bin/bash')) {
                    filename = 'script.sh';
                  } else if (codeBlock.classList.contains('language-python')) {
                    filename = 'script.py';
                  } else {
                    filename = 'code.txt';
                  }
                }
                var blob = new Blob([text], {type: 'text/plain'});
                var link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                setTimeout(function() {
                  document.body.removeChild(link);
                  URL.revokeObjectURL(link.href);
                }, 100);
              };
              pre.appendChild(btnDownload);
            }
          });
        <\/script>
      </body>
    </html>
  `;
}

onMounted(() => {
  // Los controles se manejan automáticamente en FixedControls
})

// Limpiar event listener al desmontar
onUnmounted(() => {
  // Limpiar refs
  textContentRef.value = null
  startMarkerRef.value = null
  endMarkerRef.value = null
})
</script>

<style scoped>
.blogia-overlay {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  font-size: 0.5em;
}
.blogia-controls {
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
.blogia-select{
  background: var(--color-presentacion);
  color:var(--color-bg);
  cursor: pointer;
}
.blogia-select, .blogia-input {
  font-size: var(--font-blog-normal);
  padding: 0.7em 1em;
  border-radius: 1.5em;
  font-weight: bold;
  outline: none;
  border: 0px;
}
.blogia-input {
  flex: 1;
  
  color:var(--color-bg);
}
.blogia-btn {
  width: 6em;
  font-size: var(--font-blog-normal);
  padding: 0.5em 0;
  border-radius: 1.5em;
  border: none;
  background: #3498db;
  color: var(--color-bg);
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.blogia-btn:disabled {
  background: #b1c2d5;
  cursor: not-allowed;
}
.blogia-content {
  margin-top: var(--content-margin-top);
  flex: 1 1 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-blog-normal);
  min-height: 0;
  padding: var(--content-padding);
  text-align: center;
}
.blogia-spinner {
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
.blogia-empty {
  color: white;
  margin: 2em 0;
  width: 100%;
}
.blogia-list {
  display: flex;
  flex-direction: column;
  gap: 2em;
  width: 100%;
}
.blogia-item {
  display: flex;
  cursor: pointer;
  gap: 2em;
  border-radius: 1em;
  border: 3px solid transparent;
  box-shadow: 0 2px 8px #0001;
  padding: 1.5em;
  align-items: flex-start;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  transition: border-color 0.3s ease;
  background-color: rgba(0,0,0,0.15);
}
.blogia-img {
  font-size: 3.5em;
  min-width: 60px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.blogia-info {
  flex: 1;
  text-align: left;
}
.blogia-title {
  margin: 0 0 0.5em 0;
  font-size: var(--font-blog-title);
  color: #283747;
}
.blogia-meta {
  display: flex;
  gap: 1em;
  font-size: 0.9em;
  margin-bottom: 0.5em;
  align-items: center;
}
.blogia-category {
  padding: 0.2em 0.8em;
  border-radius: 1em;
  color: #fff;
  font-weight: bold;
  font-size: 0.9em;
}
.blogia-date {
  color: #888;
  font-size: 0.9em;
}
.blogia-desc {
  margin: 0.5em 0 0 0;
  font-size: 1.1em;
  color:white;
}

/* Estilos para el multiselector */
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
  background: var(--color-light);
  color: var(--color-bg);
  transition: var(--input-transition);
}

.blogia-input::placeholder {
  background: var(--color-light);
  color: var(--color-medium);
}

.blogia-input:focus {
  border-color: var(--color-light-gold);
  background: var(--color-light);
  color: var(--color-medium);
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

.blogia-content {
  margin-top: var(--content-margin-top);
  flex: 1 1 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-blog-normal);
  min-height: 0;
  padding: var(--content-padding);
  text-align: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .blogia-controls {
    flex-direction: column;
    gap: 0.8em;
    padding: 1em;
  }
  
  .blogia-select, .blogia-input {
    width: 100%;
    font-size: var(--font-mobile-normal);
  }
  
  .blogia-btn {
    width: 100%;
    font-size: var(--font-mobile-normal);
  }
  
  .blogia-content {
    font-size: var(--font-mobile-normal);
    padding: 1em;
  }
  
  .blogia-title {
    font-size: var(--font-mobile-title);
  }
}

@media (max-width: 480px) {
  .blogia-controls {
    padding: 0.8em;
    gap: 0.6em;
  }
  
  .blogia-select, .blogia-input {
    font-size: 0.9em;
    padding: 0.5em 0.8em;
  }
  
  .blogia-btn {
    font-size: 0.9em;
    padding: 0.4em 0;
  }
  
  .blogia-content {
    font-size: 0.9em;
    padding: 0.8em;
  }
  
  .blogia-title {
    font-size: 1.2em;
  }
}

/* Responsive para el multiselector */
@media (max-width: 768px) {
  .blogia-multiselect-container {
    min-width: 150px;
  }
  
  .blogia-multiselect {
    font-size: var(--font-mobile-normal);
    padding: 0.5em 0.8em;
  }
  
  .blogia-multiselect-option {
    font-size: var(--font-mobile-normal);
    padding: 0.4em 0.8em;
  }
}
.blog-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.blog-modal {
  background: var(--color-bg);
  border-radius: 1em;
  width: 100vw;
  max-width: 100vw;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2em 1.5em 1.5em 1.5em;
  position: relative;
  box-shadow: 0 4px 32px rgba(0,0,0,0.25);
}
.blog-modal-fullwidth {
  width: 96vw;
  max-width: 100vw;
  min-height: 60vh;
  padding: 0;
  border-radius: 0;
}
.blog-modal-close {
  position: absolute;
  top: 0.5em;
  right: 0.5em;
  background: transparent;
  border: none;
  color: var(--color-light-gold);
  font-size: 2em;
  cursor: pointer;
  z-index: 10;
}
.blog-modal-content-html {
  width: 96vw;
  min-height: 60vh;
  height: 80vh;
  padding: 0;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
.blog-html-iframe {
  width: 100vw;
  height: 80vh;
  border: none;
  background: transparent;
  overflow-x: hidden;
  display: block;
}
</style> 