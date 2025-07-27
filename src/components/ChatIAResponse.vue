<template>
  <div v-if="data && (data.topic || data.image)" class="chatia-response-root">
    <!-- Título en una sola fila arriba -->
    <div v-if="data.topic" class="chatia-title-full-width">
      {{ capitalizeFirst(data.topic) }}
    </div>
    
    <!-- Phrase debajo del título -->
    <div v-if="data.phrase" class="chatia-phrase-full-width">
      {{ data.phrase }}
    </div>
    
    <!-- Descripción e imagen al lado -->
    <div class="chatia-content-flex">
      <div v-if="data.resumen" class="chatia-description-container">
        {{ data.resumen }}
      </div>
      <div v-if="data.image" class="chatia-image-container">
        <img :src="data.image" alt="Imagen relacionada" />
      </div>
    </div>
    
    <!-- Comparativa -->
    <div v-if="data.comparative && data.comparative.length" class="chatia-comparative">
      <div v-if="data.comparative_description" class="comparative-desc">{{ data.comparative_description }}</div>
      <div v-if="chartData" class="comparative-chart">
        <LineChart :chartData="chartData" :chartOptions="chartOptions" />
      </div>
    </div>
    
    <!-- Noticias IA -->
    <div v-if="data.news && Array.isArray(data.news) && data.news.length" class="chatia-news">
      <div class="news-title-centered">{{ t('chatiaresponse.news') }}</div>
      <div class="news-title-bar"></div>
      <div class="news-list">
        <div v-for="(item, idx) in data.news" :key="idx" class="news-item">
          <div class="news-valor"><b>{{ item.titulo || item.title }}</b></div>
          <div v-if="item.fuente || item.source" class="news-fuente">{{ t('chatiaresponse.source') }}: {{ item.fuente || item.source }}</div>
          <div v-if="item.fecha || item.date" class="news-fecha">{{ t('chatiaresponse.date') }}: {{ item.fecha || item.date }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue'
import LineChart from './LineChart.vue'
import { useI18n } from 'vue-i18n'
const props = defineProps<{ data: any }>()

const { t } = useI18n()

type ComparativeRow = (string | number)[];
type Comparative = ComparativeRow[];
type Colors = string[];

function getChartData(comparative: Comparative, colors: Colors) {
  if (!comparative || comparative.length < 2) return null;
  // La primera columna es la variable independiente (labels del eje X)
  const header = comparative[0];
  const labels = comparative.slice(1).map((row: ComparativeRow) => row[0]);
  const datasets = [];
  for (let col = 1; col < header.length; col++) {
    const serieLabel = header[col];
    const data = comparative.slice(1).map((row: ComparativeRow) => {
      // Convertir a número si es posible
      const val = row[col];
      return typeof val === 'string' && !isNaN(Number(val)) ? Number(val) : val;
    });
    datasets.push({
      label: serieLabel,
      data,
      backgroundColor: colors && colors[col-1] ? colors[col-1] : 'rgba(0,0,0,0)',
      borderColor: colors && colors[col-1] ? colors[col-1] : 'var(--color-light-gold)',
      pointBackgroundColor: colors && colors[col-1] ? colors[col-1] : 'var(--color-light-gold)',
      pointBorderColor: colors && colors[col-1] ? colors[col-1] : 'var(--color-light-gold)',
      fill: false,
      tension: 0.3
    });
  }
  return { labels, datasets };
}

function capitalizeFirst(text: string) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const chartData = computed(() => getChartData(props.data.comparative, props.data.colors));
const chartOptions = computed(() => ({
  responsive: true,
  plugins: {
    legend: {
      display: true,
      labels: {
        color: '#f7dc6f',
        font: { size: 16 }
      }
    },
    title: {
      display: false
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(0,0,0,0)', // sin fondo
      titleColor: '#f7dc6f',
      bodyColor: '#f7dc6f',
      borderColor: '#f7dc6f',
      borderWidth: 1
    }
  },
  scales: {
    x: {
      grid: {
        display: true,
        color: '#f7dc6f',
        lineWidth: 1
      },
      title: {
        display: true,
        text: t('chatiaresponse.x_axis'),
        color: '#f7dc6f',
        font: { size: 18 }
      },
      ticks: {
        color: '#f7dc6f',
        font: { size: 14 }
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        color: '#f7dc6f',
        lineWidth: 1
      },
      title: {
        display: true,
        text: t('chatiaresponse.y_axis'),
        color: '#f7dc6f',
        font: { size: 18 }
      },
      ticks: {
        color: '#f7dc6f',
        font: { size: 14 }
      }
    }
  }
}));
</script>

<style scoped>
.chatia-response-root {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.1em;
  height: 100%;
  color:var(--color-presentacion)
}
.chatia-header-flex {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 1.5em;
}
.chatia-header-col {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.chatia-header-col-left {
  flex: 0 0 15%;
  min-width: 120px;
  align-items: flex-start;
  padding-left: 1.5em;
}
.chatia-header-col-center {
  flex: 0 0 70%;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-width: 0;
}
.chatia-header-col-right {
  flex: 0 0 15%;
  min-width: 120px;
  align-items: flex-end;
  padding-right: 1.5em;
}
.chatia-title-left {
  font-size: 3.2em;
  font-weight: bold;
  color:var(--color-light-gold);
  text-align: left;
  word-break: break-word;
}
.chatia-phrase-under {
  font-style: italic;
  font-size: 1.1em;
  color: var(--color-light);
  margin-top: 0.2em;
  text-align: left;
}
.chatia-resumen-centered {
  text-align: center;
  margin: 0 auto;
  font-size: 1.5em;
  line-height: 1.5;
  max-width: 70vw;
  color: var(--color-light);
}
.chatia-header-img {
  width: 100%;
  height: 10em;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.chatia-header-img img {
  max-width: 100%;
  max-height: 100px;
  height: 10em;
  border-radius: 1em;
  object-fit: cover;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
.chatia-phrase {
  font-style: italic;
  text-align: center;
  margin-bottom: 0.5em;
  font-size: 1.1em;
}
.chatia-comparative {
  border: 2px solid var(--color-presentacion, #3498db);
  border-radius: 1em;
  padding: 1.5em 1em;
  margin: 1.5em auto;
  display: flex;
  flex-direction: column;
  gap: 1em;
  height: 40%;
  width: 100%;
}
.comparative-title {
  font-size: 2em;
  font-weight: bold;
  color: var(--color-light);
  text-align: center;
}
.comparative-desc {
  font-size: 1.5em;
  text-align: center;
  color: var(--color-light);
}
.comparative-chart-placeholder {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-style: italic;
  border: 1px dashed #b1c2d5;
  border-radius: 0.7em;
}
.comparative-chart {
  min-height: 220px;
  border-radius: 0.7em;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 1em;
  margin-top: 1em;
  display: flex;
  justify-content: center;
}
.chatia-news {
  border: 2px solid #217dbb;
  border-radius: 1em;
  margin: 0em auto 1em auto;
  display: flex;
  flex-direction: column;
  gap: 1em;
  width:100%;
}
.news-title {
  font-size: 2em;
  font-weight: bold;
  color: var(--color-light);
  margin-bottom: 0.7em;
  text-align: left;
}
.news-list {
  display: flex;
  flex-direction: column;
  gap: 1.2em;
}
.news-item {
  border-radius: 0.7em;
  box-shadow: 0 1px 6px rgba(0,0,0,0.04);
  padding: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}
.news-valor {
  font-size: 1.4em;
  color: var(--color-light);
}
.news-fuente {
  font-size: 1em;
  color: var(--color-light);
}
.news-fecha {
  font-size: 0.95em;
  color: var(--color-light);
}
.news-link a {
  font-size: 1em;
  color: #3498db;
  text-decoration: underline;
  word-break: break-all;
}
.news-title-centered {
  font-size: 2.2em;
  font-weight: bold;
  color: var(--color-light-gold);
  text-align: center;
}
.news-title-bar {
  width: 100%;
  height: 4px;
  background: #217dbb;
  margin: 0 auto 1em auto;
  border-radius: 2px;
}

/* Nuevo layout para ChatIAResponse */
.chatia-title-full-width {
  width: 100%;
  font-size: 3.2em;
  font-weight: bold;
  color: var(--color-light-gold);
  text-align: center;
  margin-bottom: 1em;
  word-break: break-word;
}

.chatia-phrase-full-width {
  width: 100%;
  font-style: italic;
  font-size: 1.1em;
  color: var(--color-light);
  text-align: center;
  margin-bottom: 2em;
}

.chatia-content-flex {
  display: flex;
  gap: 2em;
  align-items: flex-start;
  margin-bottom: 2em;
}

.chatia-description-container {
  flex: 0 0 80%;
  font-size: 1.5em;
  line-height: 1.5;
  color: var(--color-light);
  text-align: left;
}

.chatia-image-container {
  flex: 0 0 20%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.chatia-image-container img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 1em;
  object-fit: cover;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

/* Responsive para el nuevo layout */
@media (max-width: 768px) {
  .chatia-title-full-width {
    font-size: var(--font-mobile-title);
  }
  
  .chatia-phrase-full-width {
    font-size: var(--font-mobile-subtitle);
  }
  
  .chatia-content-flex {
    flex-direction: column;
    gap: 1em;
  }
  
  .chatia-description-container {
    flex: 0 0 100%;
    font-size: var(--font-mobile-normal);
  }
  
  .chatia-image-container {
    flex: 0 0 100%;
  }
  
  .chatia-image-container img {
    max-height: 150px;
  }
}
</style> 