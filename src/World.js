import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r128/build/three.module.js';
import { Chunk } from './Chunk.js';
import { SimplexNoise } from './SimplexNoise.js';

const CHUNK_SIZE = 16;
const CHUNK_HEIGHT = 64;
const RENDER_DISTANCE = 4;

export class World {
    constructor(scene) {
        this.scene = scene;
        this.chunks = new Map();
        this.noise = new SimplexNoise();
        this.lastChunkCoord = null;
    }

    update(chunkCoord) {
        if (this.lastChunkCoord === null || 
            this.lastChunkCoord.x !== chunkCoord.x || 
            this.lastChunkCoord.z !== chunkCoord.z) {
            this.lastChunkCoord = chunkCoord;
            this.updateChunks(chunkCoord);
        }
    }

    updateChunks(centerChunk) {
        const chunkKey = (x, z) => `${x},${z}`;
        const activeChunks = new Set();

        // Load chunks within render distance
        for (let x = -RENDER_DISTANCE; x <= RENDER_DISTANCE; x++) {
            for (let z = -RENDER_DISTANCE; z <= RENDER_DISTANCE; z++) {
                const chunkX = centerChunk.x + x;
                const chunkZ = centerChunk.z + z;
                const key = chunkKey(chunkX, chunkZ);
                activeChunks.add(key);

                if (!this.chunks.has(key)) {
                    this.generateChunk(chunkX, chunkZ);
                }
            }
        }

        // Unload distant chunks
        for (const [key, chunk] of this.chunks.entries()) {
            if (!activeChunks.has(key)) {
                chunk.dispose();
                this.chunks.delete(key);
            }
        }
    }

    generateChunk(chunkX, chunkZ) {
        const chunk = new Chunk(chunkX, chunkZ, CHUNK_SIZE, CHUNK_HEIGHT, this.noise);
        chunk.generateMesh();
        this.scene.add(chunk.group);
        const key = `${chunkX},${chunkZ}`;
        this.chunks.set(key, chunk);
    }

    getBlockAt(x, y, z) {
        const chunkX = Math.floor(x / CHUNK_SIZE);
        const chunkZ = Math.floor(z / CHUNK_SIZE);
        const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const localZ = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        const key = `${chunkX},${chunkZ}`;
        const chunk = this.chunks.get(key);

        if (!chunk) return null;
        return chunk.getBlock(localX, y, localZ);
    }

    setBlockAt(x, y, z, blockType) {
        const chunkX = Math.floor(x / CHUNK_SIZE);
        const chunkZ = Math.floor(z / CHUNK_SIZE);
        const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const localZ = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        const key = `${chunkX},${chunkZ}`;
        const chunk = this.chunks.get(key);

        if (chunk && y >= 0 && y < CHUNK_HEIGHT) {
            chunk.setBlock(localX, y, localZ, blockType);
            chunk.generateMesh();

            // Update neighboring chunks if block is on edge
            if (localX === 0) this.updateNeighboringChunk(chunkX - 1, chunkZ);
            if (localX === CHUNK_SIZE - 1) this.updateNeighboringChunk(chunkX + 1, chunkZ);
            if (localZ === 0) this.updateNeighboringChunk(chunkX, chunkZ - 1);
            if (localZ === CHUNK_SIZE - 1) this.updateNeighboringChunk(chunkX, chunkZ + 1);
        }
    }

    updateNeighboringChunk(chunkX, chunkZ) {
        const key = `${chunkX},${chunkZ}`;
        const chunk = this.chunks.get(key);
        if (chunk) chunk.generateMesh();
    }

    getChunkCount() {
        return this.chunks.size;
    }
}