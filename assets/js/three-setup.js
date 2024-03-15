import * as THREE from './three.module.js';
import { GLTFLoader } from './GLTFLoader.js';

// Setup scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('threejs-container').appendChild(renderer.domElement);

camera.position.z = 5;

// GLTF Model Loading
const gltfLoader = new GLTFLoader();
gltfLoader.load('assets/models/szch-3d-a-w-compressed.glb', function(gltf) {
    scene.add(gltf.scene);

    gltf.scene.traverse(function(node) {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    });

    // Call animate here to ensure it starts after the model is loaded
    animate();

}, undefined, function(error) {
    console.error('An error happened while loading the model:', error);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Example: Rotate the model (optional, remove if not needed)
    // if (gltf && gltf.scene) {
    //     gltf.scene.rotation.y += 0.005;
    // }

    renderer.render(scene, camera);
}

// Responsive adjustments
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
