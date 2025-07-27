<template>
  <nav class="nav-bar">
    <div class="nav-logo">
      <img src="@/assets/images/logoed.png" alt="Logo" />
    </div>
    
    <!-- Hamburger Menu Button (Mobile) -->
    <button 
      class="hamburger-btn" 
      @click="toggleMobileMenu"
      :class="{ 'active': isMobileMenuOpen }"
      aria-label="Toggle mobile menu"
    >
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>
    
    <!-- Desktop Menu -->
    <ul class="nav-list desktop-menu">
      <li>
        <router-link class="nav-btn" :class="{ selected: $route.path === '/' }" to="/">{{ t('navbar.portfolio') }}</router-link>
      </li>
      <li>
        <router-link class="nav-btn" :class="{ selected: $route.path.startsWith('/blog') }" to="/blog">{{ t('navbar.blog') }}</router-link>
      </li>
      <li>
        <router-link class="nav-btn" :class="{ selected: $route.path.startsWith('/chat-ia') }" to="/chat-ia">{{ t('navbar.apps') }}</router-link>
      </li>
      <li>
        <button class="nav-btn contact-btn" @click="openContactModal">{{ t('navbar.contact') }}</button>
      </li>
      <li>
        <select v-model="locale" class="lang-select">
          <option v-for="lang in languages" :key="lang.code" :value="lang.code">
            {{ lang.label }}
          </option>
        </select>
      </li>
    </ul>
    
    <!-- Mobile Menu Overlay -->
    <div 
      class="mobile-menu-overlay" 
      :class="{ 'active': isMobileMenuOpen }"
      @click="closeMobileMenu"
    ></div>
    
    <!-- Mobile Menu -->
    <div class="mobile-menu" :class="{ 'active': isMobileMenuOpen }">
      <router-link 
        to="/" 
        class="mobile-nav-btn" 
        :class="{ selected: $route.path === '/' }"
        @click="closeMobileMenu"
      >
        {{ t('navbar.portfolio') }}
      </router-link>
      <router-link 
        to="/blog" 
        class="mobile-nav-btn" 
        :class="{ selected: $route.path.startsWith('/blog') }"
        @click="closeMobileMenu"
      >
        {{ t('navbar.blog') }}
      </router-link>
      <router-link 
        to="/chat-ia" 
        class="mobile-nav-btn" 
        :class="{ selected: $route.path.startsWith('/chat-ia') }"
        @click="closeMobileMenu"
      >
        {{ t('navbar.apps') }}
      </router-link>
      <button 
        class="mobile-nav-btn contact-btn" 
        @click="openContactModal"
      >
        {{ t('navbar.contacts') }}
      </button>
      <div style="margin-top: 1em; text-align: center;">
        <select v-model="locale" class="lang-select">
          <option v-for="lang in languages" :key="lang.code" :value="lang.code">
            {{ lang.label }}
          </option>
        </select>
      </div>
    </div>
    
    <!-- Contact Modal -->
    <ContactModal 
      :is-visible="isContactModalOpen" 
      @close="closeContactModal" 
    />
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import ContactModal from './ContactModal.vue'
import '../styles/NavBar.css'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const $route = useRoute()
const isMobileMenuOpen = ref(false)
const isContactModalOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  // Prevent body scroll when menu is open
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}

const openContactModal = () => {
  isContactModalOpen.value = true
  closeMobileMenu() // Close mobile menu if open
}

const closeContactModal = () => {
  isContactModalOpen.value = false
}

// Handle escape key
const handleKeydown = (event: any) => {
  if (event.key === 'Escape') {
    if (isMobileMenuOpen.value) {
      closeMobileMenu()
    }
    if (isContactModalOpen.value) {
      closeContactModal()
    }
  }
}

// Add/remove event listeners
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  // Ensure body scroll is restored
  document.body.style.overflow = ''
})

const languages = [
  { code: 'es', label: '🇪🇸 ES' },
  { code: 'en', label: '🇺🇸 EN' }
]
</script>

<style scoped>
.lang-select {
  background: transparent;
  color: var(--color-light-gold);
  border: 1px solid var(--color-light-gold);
  border-radius: 1em;
  padding: 0.3em 1em;
  font-size: 1em;
  font-weight: bold;
  margin-left: 1em;
  cursor: pointer;
  outline: none;
  transition: border 0.2s;
}
.lang-select:focus {
  border: 2px solid var(--color-light-gold);
}
</style>
