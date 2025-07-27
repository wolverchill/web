# Portafolio3D - Frontend

## Descripción

Frontend en Vue 3 para la visualización interactiva de portafolio, blog y Chat IA, integrando:
- Consulta de prompts a backend con cacheo inteligente y scraping de noticias/imágenes.
- Visualización de respuestas IA, gráficas comparativas y noticias.
- Registro de métricas de visitas.

## Cambios recientes
- **Integración total con backend:**
  - Consulta a `/prompt` y `/test_prompt`.
  - Visualización de noticias e imagen obtenidas por scraping.
  - Respuestas IA cacheadas y normalizadas (NLP) para evitar duplicados.
- **Gráfica comparativa:**
  - Consumo de datos en formato matriz (arreglo de arreglos).
  - Colores y textos personalizables.
- **Historial y métricas:**
  - Consulta de historial de prompts (`/prompt-history`).
  - Consulta de métricas de visitas (`/metrics`).
- **Mejoras UX:**
  - Limpieza de prompts antes de enviar (normalización).
  - Manejo de errores y estados de carga.

## Instalación y uso

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configuración
- Asegúrate de que el backend esté corriendo y accesible (por defecto en `http://localhost:8000`).
- Puedes configurar la URL del backend en los servicios de consulta si es necesario.

### 3. Ejecutar en desarrollo
```bash
npm run dev
```

### 4. Endpoints usados
- `POST /prompt` — Consulta principal (IA + scraping + cache)
- `POST /test_prompt` — Consulta de prueba (ejemplo de IA + scraping)
- `GET /prompt-history` — Historial de prompts cacheados
- `GET /metrics` — Últimas 100 visitas
- `POST /send-email` — Envío de emails desde el frontend

## Estructura relevante
- `src/components/ChatIAOverlay.vue` — Integración de consulta y visualización IA.
- `src/components/ChatIAResponse.vue` — Renderizado de respuesta, gráfica y noticias.
- `src/components/NavBar.vue`, `FooterBar.vue`, `ThreeDScene.vue` — Navegación y layout.

## Notas
- El frontend espera respuestas normalizadas y estructuradas del backend.
- El historial y las métricas pueden ser usados para análisis y mejoras UX.
- El scraping de noticias es en tiempo real, la IA se cachea para eficiencia.

---

¿Dudas? Contacta al equipo de desarrollo.
