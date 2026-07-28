import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r128/build/three.module.js';

const BLOCK_TYPES = {
    AIR: 0,
    STONE: 1,
    GRASS: 2,
    DIRT: 3,
    SAND: 4,
    WOOD: 5,
    LEAVES: 6,
    WATER: 7
};

export class Chunk {
    constructor(x, z, size, height, noise) {
        this.x = x;
        this.z = z;
        this.size = size;
        this.height = height;
        this.noise = noise;
        this.group = new THREE.Group();
        this.group.position.set(x * size, 0, z * size);
        
        this.blocks = new Uint8Array(size * size * height);
        this.mesh = null;
        
        this.generate();
    }

    generate() {
        const WATER_LEVEL = 32;
        const STONE_HEIGHT = 48;
        
        for (let x = 0; x < this.size; x++) {
            for (let z = 0; z < this.size; z++) {
                const worldX = this.x * this.size + x;
                const worldZ = this.z * this.size + z;
                
                // Generate terrain height
                const height = this.getTerrainHeight(worldX, worldZ);
                
                for (let y = 0; y < this.height; y++) {
                    let blockType = BLOCK_TYPES.AIR;
                    
                    if (y <= 10) {
                        blockType = BLOCK_TYPES.STONE;
                    } else if (y < height - 1) {
                        blockType = BLOCK_TYPES.DIRT;
                    } else if (y < height) {
                        blockType = BLOCK_TYPES.GRASS;
                    } else if (y < WATER_LEVEL) {
                        blockType = BLOCK_TYPES.WATER;
                    }
                    
                    this.setBlock(x, y, z, blockType);
                }
            }
        }
    }

    getTerrainHeight(x, z) {
        const scale1 = this.noise.perlin(x * 0.01, z * 0.01) * 20;
        const scale2 = this.noise.perlin(x * 0.05, z * 0.05) * 10;
        const scale3 = this.noise.perlin(x * 0.1, z * 0.1) * 5;
        
        return Math.floor(30 + scale1 + scale2 + scale3);
    }

    getBlock(x, y, z) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.height || z < 0 || z >= this.size) {
            return BLOCK_TYPES.AIR;
        }
        return this.blocks[x + y * this.size * this.size + z * this.size];
    }

    setBlock(x, y, z, blockType) {
        if (x >= 0 && x < this.size && y >= 0 && y < this.height && z >= 0 && z < this.size) {
            this.blocks[x + y * this.size * this.size + z * this.size] = blockType;
        }
    }

    generateMesh() {
        if (this.mesh) {
            this.group.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }

        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];
        const uvs = [];

        let vertexIndex = 0;

        const addFace = (x, y, z, dir, blockType) => {
            const blockUV = this.getBlockUV(blockType, dir);
            
            const faceVertices = [
                [x, y, z],
                [x + 1, y, z],
                [x + 1, y + 1, z],
                [x, y + 1, z]
            ];

            if (dir === 'x+') faceVertices.forEach(v => v[0] = x + 1);
            if (dir === 'x-') faceVertices.forEach(v => v[0] = x);
            if (dir === 'y+') faceVertices.forEach(v => v[1] = y + 1);
            if (dir === 'y-') faceVertices.forEach(v => v[1] = y);
            if (dir === 'z+') faceVertices.forEach(v => v[2] = z + 1);
            if (dir === 'z-') faceVertices.forEach(v => v[2] = z);

            for (const v of faceVertices) {
                vertices.push(...v);
            }

            const uvArray = [[0, 1], [1, 1], [1, 0], [0, 0]];
            for (const [u, v] of uvArray) {
                uvs.push(blockUV.x + u * 0.0625, blockUV.y + v * 0.0625);
            }

            indices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2);
            indices.push(vertexIndex, vertexIndex + 2, vertexIndex + 3);
            vertexIndex += 4;
        };

        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.height; y++) {
                for (let z = 0; z < this.size; z++) {
                    const blockType = this.getBlock(x, y, z);
                    if (blockType === BLOCK_TYPES.AIR || blockType === BLOCK_TYPES.WATER) continue;

                    // Check each face
                    if (this.getBlock(x + 1, y, z) === BLOCK_TYPES.AIR) addFace(x, y, z, 'x+', blockType);
                    if (this.getBlock(x - 1, y, z) === BLOCK_TYPES.AIR) addFace(x - 1, y, z, 'x-', blockType);
                    if (this.getBlock(x, y + 1, z) === BLOCK_TYPES.AIR) addFace(x, y, z, 'y+', blockType);
                    if (this.getBlock(x, y - 1, z) === BLOCK_TYPES.AIR) addFace(x, y - 1, z, 'y-', blockType);
                    if (this.getBlock(x, y, z + 1) === BLOCK_TYPES.AIR) addFace(x, y, z, 'z+', blockType);
                    if (this.getBlock(x, y, z - 1) === BLOCK_TYPES.AIR) addFace(x, y, z - 1, 'z-', blockType);
                }
            }
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
        geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
        geometry.computeVertexNormals();

        const canvas = this.createTextureAtlas();
        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;

        const material = new THREE.MeshPhongMaterial({ map: texture });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.group.add(this.mesh);
    }

    getBlockUV(blockType, direction) {
        const uvMap = {
            [BLOCK_TYPES.STONE]: { x: 0, y: 0 },
            [BLOCK_TYPES.GRASS]: { x: 0, y: direction === 'y+' ? 1 : direction === 'y-' ? 2 : 0 },
            [BLOCK_TYPES.DIRT]: { x: 1, y: 0 },
            [BLOCK_TYPES.SAND]: { x: 2, y: 0 },
            [BLOCK_TYPES.WOOD]: { x: 3, y: 0 },
            [BLOCK_TYPES.LEAVES]: { x: 0, y: 3 }
        };
        
        const uv = uvMap[blockType] || { x: 0, y: 0 };
        return { x: uv.x * 0.0625, y: uv.y * 0.0625 };
    }

    createTextureAtlas() {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const blockSize = 64;
        const colors = {
            [BLOCK_TYPES.STONE]: '#888888',
            [BLOCK_TYPES.GRASS]: '#00AA00',
            [BLOCK_TYPES.DIRT]: '#8B6914',
            [BLOCK_TYPES.SAND]: '#FFEB3B',
            [BLOCK_TYPES.WOOD]: '#8B4513',
            [BLOCK_TYPES.LEAVES]: '#228B22'
        };

        let index = 0;
        for (const [blockType, color] of Object.entries(colors)) {
            const x = (index % 4) * blockSize;
            const y = Math.floor(index / 4) * blockSize;
            
            ctx.fillStyle = color;
            ctx.fillRect(x, y, blockSize, blockSize);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, blockSize, blockSize);
            
            index++;
        }

        return canvas;
    }

    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
    }
}