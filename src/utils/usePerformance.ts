import { ref, onMounted, onUnmounted } from 'vue'

export function usePerformance() {
  const isVisible = ref(true)
  const isIdle = ref(false)
  
  // Intersection Observer para lazy loading
  const useIntersectionObserver = (callback: () => void) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback()
          observer.disconnect()
        }
      })
    })
    
    return observer
  }
  
  // Debounce para optimizar llamadas
  const useDebounce = (fn: Function, delay: number) => {
    let timeoutId: number
    
    return (...args: any[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => fn(...args), delay)
    }
  }
  
  // Throttle para scroll events
  const useThrottle = (fn: Function, delay: number) => {
    let lastCall = 0
    
    return (...args: any[]) => {
      const now = Date.now()
      if (now - lastCall >= delay) {
        fn(...args)
        lastCall = now
      }
    }
  }
  
  // Detectar cuando la página no está visible
  const handleVisibilityChange = () => {
    isVisible.value = !document.hidden
  }
  
  // Detectar inactividad
  const handleIdle = () => {
    isIdle.value = true
  }
  
  const resetIdle = () => {
    isIdle.value = false
  }
  
  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('mousemove', resetIdle)
    document.addEventListener('keypress', resetIdle)
    
    // Detectar inactividad después de 5 minutos
    setTimeout(handleIdle, 300000)
  })
  
  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    document.removeEventListener('mousemove', resetIdle)
    document.removeEventListener('keypress', resetIdle)
  })
  
  return {
    isVisible,
    isIdle,
    useIntersectionObserver,
    useDebounce,
    useThrottle
  }
} 