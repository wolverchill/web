import './assets/main.css'
import './styles/variables.css'
// import './styles/global.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createI18n } from 'vue-i18n'

import esSections from './locales/es/sections.json'
import enSections from './locales/en/sections.json'
import navbarEs from './locales/es/navbar.json'
import contactEs from './locales/es/contact.json'
import chatiaresponseEs from './locales/es/chatiaresponse.json'
import navbarEn from './locales/en/navbar.json'
import contactEn from './locales/en/contact.json'
import chatiaresponseEn from './locales/en/chatiaresponse.json'

const messages = {
  es: {
    sections: esSections.sections,
    navbar: navbarEs,
    contact: contactEs,
    chatiaresponse: chatiaresponseEs
  },
  en: {
    sections: enSections.sections,
    navbar: navbarEn,
    contact: contactEn,
    chatiaresponse: chatiaresponseEn
  }
}

const i18n = createI18n({
  legacy: false,
  locale: 'es', // o 'en'
  fallbackLocale: 'en',
  messages
})

const app = createApp(App)
app.use(router)
app.use(i18n)
app.mount('#app')
