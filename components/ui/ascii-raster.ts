/** Shape-aware glyph matching. Buffers and glyph atlases are reused between frames. */
export const GLYPHS = " .'`^,:;Il!i~+_-?][}{1)(|/\\tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const FW = 4, FH = 6, FEATURES = FW * FH;
const BAYER = new Float32Array([0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]);
const hash = (n: number) => { n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); return (n ^ (n >>> 16)) >>> 0; };
const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
const region = (r: number, g: number, b: number) => {
  const l = .2126 * r + .7152 * g + .0722 * b;
  return l > 210 ? 3 : l < 35 ? 0 : l < 65 ? 2 : 1;
};

export class AsciiRaster {
  readonly sample = document.createElement('canvas');
  readonly sampleContext = this.sample.getContext('2d', { willReadFrequently: true })!;
  readonly layer = document.createElement('canvas');
  readonly layerContext = this.layer.getContext('2d')!;
  private noise = new Float32Array(0);
  private sourceReady = false;
  invalidateSource() { this.sourceReady = false; }
  private cellAlpha = new Float32Array(0);
  private glyphs: string[] = [];
  private bitmaps = new Float32Array(0);
  private candidates = new Uint16Array(16 * 12);
  private counts = new Uint8Array(16);
  private densities = new Float32Array(0);
  private palette: string[] = [];
  private luminance = new Float32Array(0);
  private coverage = new Float32Array(0);
  private ink = new Float32Array(0);
  private classes = new Uint8Array(0);
  private edgeX = new Float32Array(0);
  private edgeY = new Float32Array(0);
  private histogram = new Uint32Array(256);
  private tone = new Float32Array(256);
  private glyphIndices = new Int16Array(0);
  private heads = new Int32Array(16);
  private next = new Int32Array(0);
  private votes = new Float32Array(4);
  private target = new Float32Array(FEATURES);
  private cols = 0;
  private rows = 0;
  private cw = 5;
  private ch = 9;
  private font = '';
  private dpr = 1;
  private overlap: { left: number; top: number; right: number; bottom: number } | null = null;
  setOverlap(bounds: { left: number; top: number; right: number; bottom: number } | null) { this.overlap = bounds; }

  configure(width: number, height: number, cw: number, ch: number, fontSize: number,
    dpr: number, ramp: string, mode: 'mono' | 'tinted') {
    this.sourceReady = false;
    this.cols = Math.ceil(width / cw); this.rows = Math.ceil(height / ch);
    this.cw = cw; this.ch = ch; this.dpr = dpr;
    this.font = `${fontSize}px "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace`;
    this.sample.width = this.cols * FW; this.sample.height = this.rows * FH;
    this.layer.width = Math.round(width * dpr); this.layer.height = Math.round(height * dpr);
    const n = this.sample.width * this.sample.height, cells = this.cols * this.rows;
    this.luminance = new Float32Array(n); this.coverage = new Float32Array(n);
    this.ink = new Float32Array(n); this.classes = new Uint8Array(n);
    this.edgeX = new Float32Array(n); this.edgeY = new Float32Array(n);
    // Stable threshold field: resize may change the grid, never the cell seed.
    if (this.noise.length !== cells) this.noise = Float32Array.from({ length: cells }, (_, i) => (hash(i + 1337) % 10000) / 10000 * .94);
    this.cellAlpha = new Float32Array(cells);
    this.glyphIndices = new Int16Array(cells); this.next = new Int32Array(cells);
    this.glyphs = Array.from(new Set(Array.from(ramp + ' @#W:+o*O0|_-/\\'))).filter(c => !/\s/.test(c) || c === ' ');
    this.bitmaps = new Float32Array(this.glyphs.length * FEATURES);
    this.densities = new Float32Array(this.glyphs.length);
    const glyph = document.createElement('canvas'), tiny = document.createElement('canvas');
    glyph.width = Math.ceil(cw); glyph.height = Math.ceil(ch); tiny.width = FW; tiny.height = FH;
    const gc = glyph.getContext('2d', { willReadFrequently: true })!, tc = tiny.getContext('2d', { willReadFrequently: true })!;
    gc.font = this.font; gc.textBaseline = 'top'; gc.textAlign = 'center'; gc.fillStyle = '#fff';
    for (let g = 0; g < this.glyphs.length; g++) {
      gc.clearRect(0, 0, glyph.width, glyph.height);
      gc.fillText(this.glyphs[g], cw / 2, 0, cw);
      tc.clearRect(0, 0, FW, FH); tc.drawImage(glyph, 0, 0, FW, FH);
      const data = tc.getImageData(0, 0, FW, FH).data;
      let density = 0;
      for (let j = 0; j < FEATURES; j++) { const a = data[j * 4 + 3] / 255; this.bitmaps[g * FEATURES + j] = a; density += a; }
      this.densities[g] = density / FEATURES;
    }
    // Twelve nearest-density candidates per bucket, ordered once at atlas creation.
    for (let bucket = 0; bucket < 16; bucket++) {
      const sorted = this.glyphs.map((_, index) => index).sort((a, b) =>
        Math.abs(this.densities[a] - bucket / 15 * .65) - Math.abs(this.densities[b] - bucket / 15 * .65));
      this.counts[bucket] = Math.min(12, sorted.length);
      for (let i = 0; i < this.counts[bucket]; i++) this.candidates[bucket * 12 + i] = sorted[i];
    }
    // Four regions × four brightness levels = sixteen color batches. Preserve flat
    // source hues while lifting skin and silhouette edges for the dark background.
    const tokens = getComputedStyle(document.documentElement);
    const tint = (name: string) => tokens.getPropertyValue(name).trim();
    const base = ['--ascii-dark', '--ascii-skin', '--ascii-dark', '--white'].map(name => {
      const hex = tint(name).slice(1);
      return [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
    });
    this.palette = [];
    for (let r = 0; r < 4; r++) for (let level = 0; level < 4; level++) {
      const gain = 1 + (level - 1.5) * .04;
      const rgb = mode === 'mono' ? base[1] : base[r];
      this.palette.push(`rgb(${rgb.map(v => Math.round(clamp(v * gain, 0, 255))).join(',')})`);
    }
    if (mode === 'tinted') this.palette[11] = tint('--ascii-rim');
  }

  render(raster: HTMLCanvasElement, output: CanvasRenderingContext2D, time: number,
    reduced: boolean, pointer: { x: number; y: number; time: number }, scramble: boolean, lidScramble: boolean, resolve = 0) {
    // Geometry, coverage, tones and Sobel edges belong to the frozen source,
    // not the scroll clock. Reuse them until an actual source/grid resize.
    if (!this.sourceReady) {
      const sw = this.sample.width, sh = this.sample.height;
      this.sampleContext.clearRect(0, 0, sw, sh);
      // Actual source is 2× display resolution, then area-downsampled for matching.
      this.sampleContext.drawImage(raster, 0, 0, sw, sh);
      const pixels = this.sampleContext.getImageData(0, 0, sw, sh).data;
      this.histogram.fill(0);
      let occupied = 0;
      for (let i = 0; i < this.luminance.length; i++) {
        const offset = i * 4, a = pixels[offset + 3] / 255;
        const r = pixels[offset], g = pixels[offset + 1], b = pixels[offset + 2];
        const l = .2126 * r + .7152 * g + .0722 * b;
        this.coverage[i] = a;
        this.classes[i] = region(r, g, b);
        // Composite against the page before Sobel so transparent boundaries are edges.
        this.luminance[i] = (l * a + 79 * (1 - a)) / 255;
        if (a > .2) { this.histogram[Math.round(l)]++; occupied++; }
      }
      let cumulative = 0, low = 0, high = 255;
      for (let i = 0; i < 256; i++) {
        cumulative += this.histogram[i];
        if (cumulative < occupied * .02) low = i;
        if (cumulative < occupied * .98) high = i;
      }
      for (let i = 0; i < 256; i++) this.tone[i] = Math.pow(clamp((i - low) / Math.max(1, high - low)), .8);
      for (let i = 0; i < this.ink.length; i++) {
        const offset = i * 4, r = this.classes[i];
        const l = Math.round(.2126 * pixels[offset] + .7152 * pixels[offset + 1] + .0722 * pixels[offset + 2]);
        // Optical ink coverage is independent of the cell's display color. Dark
        // regions retain dense texture without turning lighter skin into solid @s.
        const density = r === 0 ? .62 : r === 1 ? .23 + this.tone[l] * .12 : r === 2 ? .12 : .53;
        this.ink[i] = this.coverage[i] * density;
      }
      // Sobel on the downsampled source bitmap, before it becomes a character grid.
      this.edgeX.fill(0); this.edgeY.fill(0);
      for (let y = 1; y < sh - 1; y++) for (let x = 1; x < sw - 1; x++) {
        const i = y * sw + x, l = this.luminance;
        this.edgeX[i] = -l[i - sw - 1] + l[i - sw + 1] - 2 * l[i - 1] + 2 * l[i + 1] - l[i + sw - 1] + l[i + sw + 1];
        this.edgeY[i] = -l[i - sw - 1] - 2 * l[i - sw] - l[i - sw + 1] + l[i + sw - 1] + 2 * l[i + sw] + l[i + sw + 1];
      }
      this.sourceReady = true;
    }
    const sw = this.sample.width;
    this.heads.fill(-1);
    const tick = reduced ? 0 : Math.floor(time / 100);
    for (let row = 0; row < this.rows; row++) for (let col = 0; col < this.cols; col++) {
      const cell = row * this.cols + col;
      const resolving = resolve > this.noise[cell];
      const phase = Math.max(0, resolve - this.noise[cell]);
      this.cellAlpha[cell] = resolving ? 1 - clamp(phase / .06) : 1;
      if (this.cellAlpha[cell] <= 0) continue;
      this.votes.fill(0);
      let alpha = 0, sum = 0, strongest = 0, gx = 0, gy = 0;
      let minAlpha = 1, maxAlpha = 0;
      const seed = hash(cell + tick * 7919);
      const shimmer = reduced ? 1 : 1 + ((seed % 1000) / 999 - .5) * .12;
      const dither = (BAYER[(row & 3) * 4 + (col & 3)] / 16 - .5) * .055;
      for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
        const i = (row * FH + y) * sw + col * FW + x, a = this.coverage[i];
        alpha += a; this.votes[this.classes[i]] += a;
        minAlpha = Math.min(minAlpha, a); maxAlpha = Math.max(maxAlpha, a);
        const ink = clamp(this.ink[i] * shimmer + dither * a);
        this.target[y * FW + x] = ink; sum += ink;
        const ex = this.edgeX[i], ey = this.edgeY[i], strength = ex * ex + ey * ey;
        if (strength > strongest) { strongest = strength; gx = ex; gy = ey; }
      }
      if (alpha < FEATURES * .09) continue;
      let dominant = 0;
      for (let r = 1; r < 4; r++) if (this.votes[r] > this.votes[dominant]) dominant = r;
      const bucket = Math.round(clamp(sum / FEATURES / .65) * 15);
      let best = 0, runner = 0, score = Infinity, runnerScore = Infinity;
      const solidDark = dominant === 0 && alpha > FEATURES * .8 && strongest < .32;
      const directional = strongest > .42 && (minAlpha < .8 || dominant !== 3);
      const preset = solidDark || directional || dominant === 3 || (dominant === 2 && strongest < .25);
      for (let c = 0; !preset && c < this.counts[bucket]; c++) {
        const glyph = this.candidates[bucket * 12 + c], offset = glyph * FEATURES;
        let error = 0;
        for (let j = 0; j < FEATURES; j++) { const diff = this.bitmaps[offset + j] - this.target[j]; error += diff * diff; }
        if (error < score) { runner = best; runnerScore = score; best = glyph; score = error; }
        else if (error < runnerScore) { runner = glyph; runnerScore = error; }
      }
      let char = this.glyphs[best];
      if (dominant === 0 && alpha > FEATURES * .8 && strongest < .32) char = '@#W'[hash(cell) % 3];
      if (dominant === 2 && strongest < .25) char = '.:,'[hash(cell) % 3];
      // Direction is perpendicular to the Sobel gradient (the edge tangent).
      if (strongest > .42 && (minAlpha < .8 || dominant !== 3)) {
        const angle = ((Math.atan2(gy, gx) * 180 / Math.PI) + 180) % 180;
        char = angle < 22.5 || angle >= 157.5 ? '|' : angle < 67.5 ? '/' : angle < 112.5 ? '_' : '\\';
      }
      if (dominant === 3) char = hash(cell) & 1 ? 'O' : '0';
      // Small dark islands surrounded by white remain legible pupil glyphs.
      if (dominant === 0 && this.votes[3] > FEATURES * .12) char = '@';
      if (!reduced && seed % 100 < 3 && strongest < .3 && dominant !== 3) {
        char = solidDark ? '@#W'[seed % 3] : preset ? char : this.glyphs[runner];
      }
      const x = (col + .5) * this.cw, y = row * this.ch;
      const nearby = !reduced && Math.hypot(x - pointer.x, y - pointer.y) < 80 && time - pointer.time < 450;
      if (!reduced && (nearby || (scramble && seed % 3 !== 0) || (lidScramble && row < this.rows * .27 && col > this.cols * .28 && col < this.cols * .73 && seed % 3 === 0))) {
        char = this.glyphs[this.candidates[bucket * 12 + seed % this.counts[bucket]]];
      }
      if (resolving && phase < .055) char = this.glyphs[seed % this.glyphs.length];
      let level = Math.min(3, Math.floor((shimmer - .94) / .12 * 4));
      if (dominant === 2) level = Math.min(2, level);
      // Slightly lighter outer rim: hue stays purple, only boundary glyphs lift.
      if (dominant === 0 && maxAlpha - minAlpha > .4) { dominant = 2; level = 3; }
      if (nearby) { dominant = 3; level = 3; }
      const color = dominant * 4 + Math.max(0, level);
      this.glyphIndices[cell] = this.glyphs.indexOf(char);
      this.next[cell] = this.heads[color]; this.heads[color] = cell;
    }
    const width = this.layer.width / this.dpr, height = this.layer.height / this.dpr;
    output.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    output.globalAlpha = 1; output.shadowBlur = 0;
    output.clearRect(0, 0, width, height);
    const layer = this.layerContext;
    layer.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    layer.font = this.font; layer.textBaseline = 'top'; layer.textAlign = 'center';
    // Batch all glyphs into one layer. A single colored blur of that layer is
    // equivalent to per-color glow, without filtering each glyph or color group.
    layer.clearRect(0, 0, width, height);
    for (let color = 0; color < 16; color++) {
      if (this.heads[color] === -1) continue;
      layer.fillStyle = this.palette[color];
      for (let cell = this.heads[color]; cell !== -1; cell = this.next[cell]) {
        const x = (cell % this.cols) * this.cw, y = Math.floor(cell / this.cols) * this.ch;
        layer.globalAlpha = this.cellAlpha[cell];
        layer.fillText(this.glyphs[this.glyphIndices[cell]] || '.', x + this.cw / 2, y, this.cw);
      }
    }
    layer.globalAlpha = 1;
    // Ink over the DOM title is darker, but empty cells remain transparent.
    if (this.overlap) {
      const b = this.overlap;
      layer.save();
      layer.beginPath(); layer.rect(b.left, b.top, b.right - b.left, b.bottom - b.top); layer.clip();
      layer.globalCompositeOperation = 'source-atop';
      layer.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ascii-dark').trim(); layer.fillRect(b.left, b.top, b.right - b.left, b.bottom - b.top);
      layer.restore();
    }
    output.globalAlpha = .35;
    output.filter = `blur(${3 * this.dpr}px)`;
    output.drawImage(this.layer, 0, 0, width, height);
    output.filter = 'none'; output.globalAlpha = 1;
    output.drawImage(this.layer, 0, 0, width, height);
  }
}
