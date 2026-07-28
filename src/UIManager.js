export class UIManager {
    constructor() {
        this.fpsElement = document.getElementById('fps');
        this.posElement = document.getElementById('pos');
        this.chunksElement = document.getElementById('chunks');
    }

    updateFPS(fps) {
        this.fpsElement.textContent = `FPS: ${fps}`;
    }

    updatePosition(pos) {
        this.posElement.textContent = `Position: ${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}`;
    }

    updateChunks(count) {
        this.chunksElement.textContent = `Chunks: ${count}`;
    }
}