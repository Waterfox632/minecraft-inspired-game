// Simplex noise implementation
export class SimplexNoise {
    constructor(seed = 0) {
        this.permutation = [];
        for (let i = 0; i < 256; i++) {
            this.permutation[i] = i;
        }

        // Fisher-Yates shuffle with seed
        for (let i = 255; i > 0; i--) {
            const j = Math.floor((Math.sin(seed + i) + 1) / 2 * (i + 1));
            [this.permutation[i], this.permutation[j]] = [this.permutation[j], this.permutation[i]];
        }

        // Duplicate the permutation array
        this.p = [];
        for (let i = 0; i < 512; i++) {
            this.p[i] = this.permutation[i & 255];
        }
    }

    perlin(x, y, z = 0) {
        // Find unit cube that contains point
        let xi = Math.floor(x) & 255;
        let yi = Math.floor(y) & 255;
        let zi = Math.floor(z) & 255;

        // Find relative x, y, z in cube
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        // Compute fade curves
        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        // Hash coordinates of 8 cube corners
        const a = this.p[xi] + yi;
        const aa = this.p[a] + zi;
        const ab = this.p[a + 1] + zi;
        const b = this.p[xi + 1] + yi;
        const ba = this.p[b] + zi;
        const bb = this.p[b + 1] + zi;

        // Add blended results from 8 corners
        const result = this.lerp(
            w,
            this.lerp(v, this.grad(this.p[aa], x, y, z), this.grad(this.p[ba], x - 1, y, z)),
            this.lerp(v, this.grad(this.p[ab], x, y - 1, z), this.grad(this.p[bb], x - 1, y - 1, z))
        );

        return result;
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t, a, b) {
        return a + t * (b - a);
    }

    grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 8 ? y : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
}