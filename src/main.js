import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r128/build/three.module.js';
import { World } from './World.js';
import { Player } from './Player.js';
import { InputManager } from './InputManager.js';
import { UIManager } from './UIManager.js';

// Initialize scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue
scene.fog = new THREE.Fog(0x87ceeb, 200, 300);

// Initialize camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 64, 0);

// Initialize renderer
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowShadowMap;

// Lighting
const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(100, 100, 50);
sunLight.castShadow = true;
sunLight.shadow.camera.left = -150;
sunLight.shadow.camera.right = 150;
sunLight.shadow.camera.top = 150;
sunLight.shadow.camera.bottom = -150;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
scene.add(sunLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Initialize managers
const inputManager = new InputManager(camera);
const uiManager = new UIManager();
const world = new World(scene);
const player = new Player(camera, inputManager);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Game loop
let lastTime = performance.now();
let frameCount = 0;
let fpsTime = 0;

function animate() {
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Update
    inputManager.update();
    player.update(deltaTime, world);
    world.update(player.getChunkCoord());

    // Render
    renderer.render(scene, camera);

    // FPS counter
    frameCount++;
    fpsTime += deltaTime;
    if (fpsTime >= 1) {
        uiManager.updateFPS(frameCount);
        frameCount = 0;
        fpsTime = 0;
    }

    // UI updates
    uiManager.updatePosition(camera.position);
    uiManager.updateChunks(world.getChunkCount());
}

animate();