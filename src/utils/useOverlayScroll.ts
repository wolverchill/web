import { onMounted, onBeforeUnmount, nextTick } from 'vue'
import type { Ref } from 'vue'

export function useOverlayScroll(textContentRef: Ref<HTMLElement | null>, startMarkerRef: Ref<HTMLElement | null>, endMarkerRef: Ref<HTMLElement | null>) {
  onMounted(() => {
    let animationFrame: number | null = null
    function syncScroll() {
      if (window.scrollController && textContentRef.value && startMarkerRef.value && endMarkerRef.value) {
        const factor = 120
        let y = -window.scrollController.getRotations().rotationY * factor
        const frame = textContentRef.value.parentElement
        const textContent = textContentRef.value
        const startMarker = startMarkerRef.value
        const endMarker = endMarkerRef.value
        if (frame && textContent && startMarker && endMarker) {
          const frameRect = frame.getBoundingClientRect()
          const contentRect = textContent.getBoundingClientRect()
          const startRect = startMarker.getBoundingClientRect()
          const endRect = endMarker.getBoundingClientRect()
          const minY = Math.min(0, frameRect.height - contentRect.height)
          const maxY = 0
          if (y > maxY) {
            y = maxY
            window.scrollController.resetRotationYTo(-maxY / factor)
          }
          if (y < minY) {
            y = minY
            window.scrollController.resetRotationYTo(-minY / factor)
          }
          textContent.style.transform = `translateY(${y}px)`
        }
      }
      animationFrame = requestAnimationFrame(syncScroll)
    }
    nextTick(() => {
      animationFrame = requestAnimationFrame(syncScroll)
    })
    onBeforeUnmount(() => {
      if (animationFrame) cancelAnimationFrame(animationFrame)
    })
  })
} 