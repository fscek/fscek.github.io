// Assuming Three.js and GLTFLoader are included in your HTML via <script> tags
// and you're using modules

import * as THREE from 'assets/js/three.module.js';
import { GLTFLoader } from 'assets/js/GLTFLoader.js';

// Setup scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('threejs-container').appendChild(renderer.domElement);

camera.position.set(0, 0, 2);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 1, 0);
scene.add(directionalLight);

const loader = new GLTFLoader();

loader.load(
  'assets/models/szch-3d-a-w.gltf',
  function (gltf) {
    scene.add(gltf.scene);
    animate();
  },
  undefined,
  function (error) {
    console.error('An error happened during loading the model:', error);
  }
);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
