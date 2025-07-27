<template>
  <section class="threejs-section" aria-label="Recorrido 3D">
    <canvas ref="threeCanvas" class="three-canvas"></canvas>
    <!-- Eliminar <OverlayContent ref="overlayRef" /> -->
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import * as THREE from 'three'
import { ScrollController } from '@/utils/scrollController'
import sectionsData from '@/data/sections.json'
import { planetDiffuseBase64, cloudsAlphaBase64 } from '@/assets/base64_images/textures';
import '../styles/ThreeDScene.css';
// Eliminar import OverlayContent from './OverlayContent.vue'


const threeCanvas = ref<HTMLCanvasElement | null>(null)
// Eliminar overlayRef y toda referencia a overlayRef en el script
let renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera
let planet: THREE.Mesh, dome: THREE.Mesh, clouds: THREE.Mesh
let scrollController: ScrollController
let lastAllowedY = 0 // Para resetear el scroll sobrante
let autoRotation = 0;
const AUTO_ROTATION_SPEED = 0.001;
let stars: THREE.Points;


function formatContent(content: string) {
  return content.split('<=>').join('<br>');
}

// Función para crear un alphaMap circular suave
function createCircleAlphaMap(size = 32) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null; // Si no hay contexto, retorna null
  const r = size / 2;
  ctx.clearRect(0, 0, size, size);
  const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(r, r, r, 0, 2 * Math.PI);
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
}

onMounted(() => {
  // Inicializar controlador de scroll
  scrollController = new ScrollController()
  // Exponer el scrollController globalmente para navegación
  window.scrollController = scrollController

  // Renderer
  renderer = new THREE.WebGLRenderer(
    { 
      canvas: threeCanvas.value!, 
      antialias: false,
      powerPreference: "high-performance",
      alpha: true,
      stencil: false,
      depth: true
    })
  renderer.setClearColor('#283747', 1) // color de fondo del cielo
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(threeCanvas.value!.clientWidth, threeCanvas.value!.clientHeight, false)

  // Scene
  scene = new THREE.Scene()

  // Camera
  const aspect = threeCanvas.value!.clientWidth / threeCanvas.value!.clientHeight
  camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000)
  camera.position.set(0, 0, 70)

  // Luz ambiental
  const ambientLight = new THREE.AmbientLight(0xebedef, 0.4) // --color-bg, menor intensidad
  scene.add(ambientLight)
  // Luz direccional
  const dirLight = new THREE.DirectionalLight(0xebedef, 0.5) // --color-bg, menor intensidad
  dirLight.position.set(5, 10, 7)
  scene.add(dirLight)

  // Cargar texturas
  const textureLoader = new THREE.TextureLoader()

  // Función para cargar textura con manejo de errores
  const loadTexture = (path: string) => {
    return textureLoader.load(
      path,
      undefined, // onLoad
      undefined, // onProgress
      (error) => {
        console.error('Error loading texture:', path, error)
      }
    )
  }

  // Texturas 
  const planetDiffuse = loadTexture(planetDiffuseBase64);
  const cloudsDiffuse = loadTexture(cloudsAlphaBase64)

  // Configurar mapeo de textura de nubes para evitar cortes
  cloudsDiffuse.wrapS = THREE.RepeatWrapping
  cloudsDiffuse.wrapT = THREE.RepeatWrapping
  cloudsDiffuse.repeat.set(1, 1) // Sin repetición
  cloudsDiffuse.offset.set(0, 0) // Sin offset
  cloudsDiffuse.rotation = 0 // Sin rotación
  cloudsDiffuse.center.set(0.5, 0.5) // Centrar la rotación

  // Planeta (esfera mucho más grande)
  const planetGeometry = new THREE.SphereGeometry(45, 64, 64)
  
  // Distorsionar vértices para crear montañas
  const positions = planetGeometry.attributes.position.array
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i]
    const y = positions[i + 1] 
    const z = positions[i + 2]
    
    // Calcular distancia desde el centro
    const distance = Math.sqrt(x * x + y * y + z * z)
    
    // Aplicar ruido para crear montañas
    const noise = Math.sin(x * 0.3) * Math.cos(z * 0.3) * Math.sin(y * 0.3) * 7
    const newDistance = distance + noise
    
    // Normalizar y escalar
    const scale = newDistance / distance
    positions[i] *= scale
    positions[i + 1] *= scale  
    positions[i + 2] *= scale
  }
  
  planetGeometry.attributes.position.needsUpdate = true
  
  // Material del planeta con texturas
  const planetMaterial = new THREE.MeshStandardMaterial({
    map: planetDiffuse,
    // normalMap: planetNormal,
    // roughnessMap: planetRoughness,
    side: THREE.FrontSide,
    flatShading: false
  })
  
  planet = new THREE.Mesh(planetGeometry, planetMaterial)
  planet.position.set(0, -42, 0)
  scene.add(planet)

  // Elimina la textura del cielo y crea el domo sin textura
  const domeGeometry = new THREE.SphereGeometry(100, 24, 16)
  const domeMaterial = new THREE.MeshStandardMaterial({
    color: 0x283747, // color de fondo del cielo solicitado
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.5
  })
  dome = new THREE.Mesh(domeGeometry, domeMaterial)
  dome.position.set(0, -42, 0)
  scene.add(dome)

  // Sistema de partículas de estrellas con tamaño fijo
  const numStars = 150;
  const skyRadius = 120;
  const starsGeometry = new THREE.BufferGeometry();
  const starPositions = [];
  const starColors = [];
  for (let i = 0; i < numStars; i++) {
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = skyRadius + Math.random() * 2;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    starPositions.push(x, y, z);
    starColors.push(1, 1, 1); // blanco puro
  }
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));

  const vertexShader = `
    varying vec3 vColor;
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = 1.5 * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    varying vec3 vColor;
    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      if (d > 0.5) discard;
      gl_FragColor = vec4(vColor * 2.5, 1.0);
    }
  `;

  const starsMaterial = new THREE.ShaderMaterial({
    vertexColors: true,
    transparent: true,
    vertexShader,
    fragmentShader
  });
  stars = new THREE.Points(starsGeometry, starsMaterial);
  dome.add(stars);

  // Nubes con textura y transparencia
  const cloudsGeometry = new THREE.SphereGeometry(80, 24, 16)
  
  // Ajustar coordenadas UV para mejor mapeo de textura
  const uvs = cloudsGeometry.attributes.uv
  for (let i = 0; i < uvs.count; i++) {
    const u = uvs.getX(i)
    const v = uvs.getY(i)
    
    // Ajustar coordenadas UV para evitar cortes
    uvs.setXY(i, u * 1.0, v * 1.0)
  }
  
  const cloudsMaterial = new THREE.MeshStandardMaterial({
    map: cloudsDiffuse,
    // alphaMap: cloudsAlpha,
    // normalMap: cloudsNormal,
    transparent: true,
    opacity: 0.8,
    side: THREE.BackSide
  })
  clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial)
  clouds.position.set(0, -42, 0)
  scene.add(clouds)

  nextTick(() => animate()) // Asegura refs listos
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (scrollController) {
    scrollController.destroy()
  }
  renderer.dispose()
})

function onResize() {
  if (!renderer || !camera || !threeCanvas.value) return
  const width = threeCanvas.value.clientWidth
  const height = threeCanvas.value.clientHeight
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) 
  renderer.setSize(window.innerWidth, window.innerHeight, false)
  renderer.shadowMap.enabled = false 
  renderer.outputColorSpace = THREE.SRGBColorSpace
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

function animate() {
  requestAnimationFrame(animate)
  let allow3DRotation = true;
  // Solo lógica de rotación 3D, eliminar lógica de scroll sincronizado con overlayRef
  if (allow3DRotation && scrollController && planet && dome && clouds) {
    scrollController.applyRotations(planet, dome, clouds)
  }
  // Animación automática: SIEMPRE se suma
  if (dome) dome.rotation.y += AUTO_ROTATION_SPEED;
  if (clouds) clouds.rotation.y += AUTO_ROTATION_SPEED;
  if (
    clouds &&
    clouds.material &&
    !Array.isArray(clouds.material)
  ) {
    const mat = clouds.material as THREE.MeshStandardMaterial;
    if (mat.map && mat.map.image) {
      mat.map.offset.x += 0.00002; // Velocidad de animación atmosférica
      mat.map.needsUpdate = true;
    }
  }
  if (stars) {
    stars.rotation.y += 0.001; // Velocidad de animación atmosférica de las estrellas
  }
  renderer.render(scene, camera)
}
</script>
