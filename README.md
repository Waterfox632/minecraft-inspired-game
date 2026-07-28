# Voxel World - 3D Minecraft-Inspired Game

A fully original 3D voxel-based game engine built with Three.js. Create your own blocky worlds with procedurally generated terrain, block placement/destruction, and first-person exploration.

## Features

✨ **Procedural Generation** - Infinite, seamlessly generated terrain using Simplex noise
🎮 **Full First-Person Controls** - WASD movement, mouse look, jumping, and sprinting  
🧱 **Block Building System** - Place and destroy blocks with different materials
📦 **Chunk-Based World** - Efficient rendering with dynamic chunk loading/unloading
🌍 **Multiple Block Types** - Stone, Grass, Dirt, Sand, Wood, Leaves, Water
⚡ **Optimized Performance** - Frustum culling, LOD, and efficient mesh generation
🎨 **Dynamic Texturing** - Custom texture atlas with block-specific UV mapping

## Controls

| Key | Action |
|-----|--------|
| **W/A/S/D** | Move Forward/Left/Back/Right |
| **Space** | Jump |
| **Shift** | Sprint (2x speed) |
| **Mouse** | Look Around |
| **Left Click** | Destroy Block |
| **Right Click** | Place Block |
| **1-6** | Select Block Type |
| **F** | Toggle Fullscreen |

## Quick Start

1. **Open in Browser**: Simply open `index.html` in a modern web browser (Chrome, Firefox, Safari, or Edge)
2. **Click to Lock Mouse**: Click anywhere to lock your mouse pointer for camera control
3. **Start Exploring**: Use WASD to move around the procedurally generated world
4. **Build & Destroy**: Left-click to remove blocks, right-click to place them

## Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

Requires WebGL 2.0 support.

## Architecture

### Core Systems

- **main.js** - Game initialization, scene setup, main game loop
- **World.js** - World manager, chunk loading/unloading, block interactions
- **Chunk.js** - Individual chunk terrain generation and mesh creation
- **Player.js** - Player physics, movement, camera control, block placement
- **InputManager.js** - Keyboard and mouse input handling with camera control
- **SimplexNoise.js** - Procedural noise generation for terrain
- **UIManager.js** - HUD and overlay updates

### Key Features Explained

#### Procedural Generation
Terrain is generated using 3 layers of Simplex noise at different scales, creating varied topography with mountains, valleys, and coastlines.

#### Chunk System
The world is divided into 16×16 chunks. Chunks within render distance are loaded; distant chunks are unloaded to save memory and performance.

#### Block Physics
- Collision detection prevents walking through solid blocks
- Gravity system with jumping mechanics
- Ground detection for determining when player can jump

#### Block Interaction
- Left-click destroys blocks up to 5 blocks away
- Right-click places blocks from inventory
- Neighboring chunks update when blocks on edges are modified

## Customization

### Change Terrain Generation
Edit `src/Chunk.js` in the `getTerrainHeight()` method to adjust noise scales and height ranges.

### Add Block Types
1. Add new block constant to `BLOCK_TYPES` in `src/Chunk.js`
2. Define color in `createTextureAtlas()`
3. Add UV mapping in `getBlockUV()`

### Adjust Physics
Edit constants in `src/Player.js`:
- `moveSpeed` - Walking speed (default: 8)
- `jumpForce` - Jump height (default: 10)
- `gravity` - Gravity strength (default: 20)
- `sprintMultiplier` - Sprint speed multiplier (default: 1.5)

### Modify Render Distance
Change `RENDER_DISTANCE` in `src/World.js` (default: 4 chunks)

### Adjust Mouse Sensitivity
Edit `sensitivity` in `src/InputManager.js` (default: 0.003)

## Performance Tips

- Reduce `RENDER_DISTANCE` in World.js on lower-end systems
- Use Firefox for better WebGL performance on some systems
- Disable shadows by commenting out shadow-related code in main.js
- Increase chunk update frequency for smoother terrain loading

## Future Enhancements

- [ ] Trees and vegetation generation
- [ ] Multiple biomes (desert, forest, snow, etc.)
- [ ] Inventory system with crafting
- [ ] Creative/Survival game modes
- [ ] Multiplayer support (WebSockets)
- [ ] Save/Load worlds (localStorage)
- [ ] Advanced lighting and day/night cycle
- [ ] Sound effects and music
- [ ] Particle effects
- [ ] NPC entities and mobs

## Technical Details

### Technology Stack
- **Three.js r128** - 3D graphics rendering
- **WebGL 2.0** - GPU acceleration
- **ES6 Modules** - Code organization
- **Canvas API** - Texture generation

### Performance Characteristics
- **Chunk Size**: 16×16×64 blocks
- **Render Distance**: 4 chunks (configurable)
- **Max Chunks Loaded**: 81 (9×9 grid)
- **Block Types**: 7 (Air, Stone, Grass, Dirt, Sand, Wood, Leaves, Water)

### Optimization Techniques
- Greedy meshing for efficient polygon reduction
- Chunk-based LOD system
- Dynamic texture atlasing
- Frustum culling via Three.js
- Raycasting for block interaction

## Troubleshooting

**Black screen?**
- Check browser console (F12) for errors
- Verify WebGL support: https://get.webgl.org/
- Try a different browser

**Low FPS?**
- Reduce `RENDER_DISTANCE` in World.js
- Lower graphics quality or disable shadows
- Close other browser tabs
- Update GPU drivers

**Mouse not working?**
- Click in the game window to lock pointer
- Press Esc or click outside to unlock
- Check browser console for permission errors

## License

This project is original work and free to use under the MIT License. It is not affiliated with or endorsed by any existing game properties.

## Credits

Built with:
- [Three.js](https://threejs.org/) - 3D graphics library
- [Perlin Noise](https://en.wikipedia.org/wiki/Perlin_noise) - Procedural generation algorithm
- [WebGL](https://www.khronos.org/webgl/) - Graphics API

---

**Happy building!** 🎮✨

Made with ❤️ by Waterfox632
