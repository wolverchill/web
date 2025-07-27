import * as THREE from 'three'
import { hasScrolled } from '@/stores/hasScrolled'

export class ScrollController {
  private scrollSpeed = 0.01
  private rotationX = 0
  private rotationY = 0
  private hasSetScrolled = false

  constructor() {
    this.init()
  }

  private init() {
    // Habilitar ambos eventos para cualquier dispositivo
    this.initWheelEvents()
    this.initTouchEvents()
  }

  private initWheelEvents() {
    
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      // Planeta gira sobre X (más lento), cielo sobre Y
      this.rotationX += e.deltaY * this.scrollSpeed * 0.3
      this.rotationY += e.deltaY * this.scrollSpeed * 0.5
      if (!this.hasSetScrolled) {
        hasScrolled.value = true
        this.hasSetScrolled = true
      }
    }

    document.addEventListener('wheel', handleWheel, { passive: false })
  }

  private initTouchEvents() {
    
    let startY = 0
    let isTouching = false

    const handleTouchStart = (e: TouchEvent) => {
      isTouching = true
      startY = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouching) return
      
      e.preventDefault()
      const currentY = e.touches[0].clientY
      const deltaY = startY - currentY
      
      // Planeta gira sobre X (más lento), cielo sobre Y
      this.rotationX += deltaY * this.scrollSpeed * 0.03
      this.rotationY += deltaY * this.scrollSpeed * 0.25
      
      startY = currentY
      if (!this.hasSetScrolled) {
        hasScrolled.value = true
        this.hasSetScrolled = true
      }
    }

    const handleTouchEnd = () => {
      isTouching = false
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })
  }

  // Función para obtener las rotaciones actuales
  public getRotations() {
    return {
      rotationX: this.rotationX,
      rotationY: this.rotationY
    }
  }

  // Función para aplicar rotaciones a objetos 3D
  public applyRotations(planet: THREE.Mesh, dome: THREE.Mesh, clouds: THREE.Mesh) {
    if (planet) {
      planet.rotation.x = this.rotationX * 0.2;
    }
    // No modificar dome.rotation.y ni clouds.rotation.y aquí (animación atmosférica automática)
  }

  // Función para resetear rotaciones
  public resetRotations() {
    this.rotationX = 0
    this.rotationY = 0
  }
  // Función para fijar la rotación vertical (rotationY) a un valor específico
  public resetRotationYTo(value: number) {
    this.rotationY = value
  }

  // Función para ajustar velocidad de scroll
  public setScrollSpeed(speed: number) {
    this.scrollSpeed = speed
  }

  // Función para destruir eventos
  public destroy() {
    console.log('ScrollController destroyed')
  }
} 