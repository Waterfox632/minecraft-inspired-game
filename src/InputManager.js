export class InputManager {
    constructor(camera) {
        this.keys = {};
        this.mouseDown = false;
        this.mouseRightDown = false;
        this.camera = camera;
        this.euler = { x: 0, y: 0 };
        this.sensitivity = 0.003;
        
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        window.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('mouseup', (e) => this.onMouseUp(e));
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Pointer lock
        document.addEventListener('click', () => {
            document.body.requestPointerLock?.();
        });
    }

    onKeyDown(event) {
        const key = event.key.toLowerCase();
        this.keys[key] = true;
        
        if (key === 'f') {
            document.documentElement.requestFullscreen?.();
        }
    }

    onKeyUp(event) {
        const key = event.key.toLowerCase();
        this.keys[key] = false;
    }

    onMouseDown(event) {
        if (event.button === 0) this.mouseDown = true; // Left click
        if (event.button === 2) this.mouseRightDown = true; // Right click
    }

    onMouseUp(event) {
        if (event.button === 0) this.mouseDown = false;
        if (event.button === 2) this.mouseRightDown = false;
    }

    onMouseMove(event) {
        if (document.pointerLockElement) {
            this.euler.y -= event.movementX * this.sensitivity;
            this.euler.x -= event.movementY * this.sensitivity;
            
            // Clamp vertical rotation
            this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));
            
            // Apply rotation
            this.camera.rotation.order = 'YXZ';
            this.camera.rotation.y = this.euler.y;
            this.camera.rotation.x = this.euler.x;
        }
    }

    update() {
        // Input updates handled in event listeners
    }
}