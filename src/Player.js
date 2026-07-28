import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r128/build/three.module.js';

const CHUNK_SIZE = 16;

export class Player {
    constructor(camera, inputManager) {
        this.camera = camera;
        this.inputManager = inputManager;
        
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        this.grounded = false;
        
        this.moveSpeed = 8;
        this.sprintMultiplier = 1.5;
        this.jumpForce = 10;
        this.gravity = 20;
        this.friction = 0.85;
        
        this.eyeHeight = 1.6;
        this.collisionRadius = 0.3;
        this.selectedBlock = 1; // Grass block
        
        // Raycaster for block interaction
        this.raycaster = new THREE.Raycaster();
        this.blockReach = 5;
        
        this.updateInventoryUI();
    }

    update(deltaTime, world) {
        this.handleInput(world);
        this.updatePhysics(deltaTime, world);
        this.updateChunkCoord();
    }

    handleInput(world) {
        const moveDirection = new THREE.Vector3();
        
        // Get forward/right vectors from camera
        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();
        
        this.camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
        
        // Handle WASD
        if (this.inputManager.keys['w']) moveDirection.add(forward);
        if (this.inputManager.keys['s']) moveDirection.add(forward.clone().multiplyScalar(-1));
        if (this.inputManager.keys['a']) moveDirection.sub(right);
        if (this.inputManager.keys['d']) moveDirection.add(right);
        
        // Normalize and apply speed
        if (moveDirection.length() > 0) {
            moveDirection.normalize();
            const speed = this.inputManager.keys['shift'] ? this.moveSpeed * this.sprintMultiplier : this.moveSpeed;
            moveDirection.multiplyScalar(speed);
            
            this.velocity.x = moveDirection.x;
            this.velocity.z = moveDirection.z;
        } else {
            this.velocity.x *= this.friction;
            this.velocity.z *= this.friction;
        }
        
        // Jump
        if (this.inputManager.keys[' '] && this.grounded) {
            this.velocity.y = this.jumpForce;
            this.grounded = false;
        }
        
        // Block placement/destruction
        if (this.inputManager.mouseDown) {
            this.handleBlockInteraction(world, false);
            this.inputManager.mouseDown = false;
        }
        
        if (this.inputManager.mouseRightDown) {
            this.handleBlockInteraction(world, true);
            this.inputManager.mouseRightDown = false;
        }
        
        // Block selection
        for (let i = 1; i <= 6; i++) {
            if (this.inputManager.keys[i.toString()]) {
                this.selectedBlock = i;
                this.updateInventoryUI();
            }
        }
    }

    handleBlockInteraction(world, place) {
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        
        const origin = this.raycaster.ray.origin.clone();
        const direction = this.raycaster.ray.direction.clone().normalize();
        
        for (let i = 0; i < this.blockReach * 10; i++) {
            const pos = origin.clone().addScaledVector(direction, i * 0.1);
            const blockX = Math.floor(pos.x);
            const blockY = Math.floor(pos.y);
            const blockZ = Math.floor(pos.z);
            
            const block = world.getBlockAt(blockX, blockY, blockZ);
            if (block && block !== 0 && block !== 7) { // Not air or water
                if (place) {
                    // Place block on adjacent side
                    const prevPos = origin.clone().addScaledVector(direction, (i - 1) * 0.1);
                    const placeX = Math.floor(prevPos.x);
                    const placeY = Math.floor(prevPos.y);
                    const placeZ = Math.floor(prevPos.z);
                    
                    // Don't place inside player
                    const dist = this.camera.position.distanceTo(new THREE.Vector3(placeX + 0.5, placeY + 0.5, placeZ + 0.5));
                    if (dist > 1) {
                        world.setBlockAt(placeX, placeY, placeZ, this.selectedBlock);
                    }
                } else {
                    world.setBlockAt(blockX, blockY, blockZ, 0);
                }
                break;
            }
        }
    }

    updatePhysics(deltaTime, world) {
        // Apply gravity
        this.velocity.y -= this.gravity * deltaTime;
        
        // Update position
        this.camera.position.addScaledVector(this.velocity, deltaTime);
        
        // Simple collision detection
        const playerPos = this.camera.position;
        playerPos.y = Math.max(1.62, playerPos.y); // Prevent falling through ground
        
        // Ground detection
        const blockBelow = world.getBlockAt(
            Math.floor(playerPos.x),
            Math.floor(playerPos.y - 1.62),
            Math.floor(playerPos.z)
        );
        
        this.grounded = blockBelow !== null && blockBelow !== 0 && blockBelow !== 7;
        
        if (this.grounded && this.velocity.y < 0) {
            this.velocity.y = 0;
        }
    }

    updateChunkCoord() {
        const x = Math.floor(this.camera.position.x / 16);
        const z = Math.floor(this.camera.position.z / 16);
        this._chunkCoord = { x, z };
    }

    getChunkCoord() {
        return this._chunkCoord || { x: 0, z: 0 };
    }

    updateInventoryUI() {
        const slotsDiv = document.getElementById('slots');
        slotsDiv.innerHTML = '';
        
        const blockTypes = ['Stone', 'Grass', 'Dirt', 'Sand', 'Wood', 'Leaves'];
        
        for (let i = 1; i <= 6; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot' + (i === this.selectedBlock ? ' selected' : '');
            slot.textContent = i;
            slot.title = blockTypes[i - 1];
            slotsDiv.appendChild(slot);
        }
    }
}