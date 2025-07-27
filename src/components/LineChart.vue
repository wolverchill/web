<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const props = defineProps<{
  chartData: any,
  chartOptions?: any
}>()
</script>

<template>
  <Line :data="chartData" :options="chartOptions" />
</template> 