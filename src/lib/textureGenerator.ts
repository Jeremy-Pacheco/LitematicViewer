import * as THREE from "three";

/**
 * Generate procedural block textures
 * Creates variations using noise, shadows, and details
 */

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generatePerlinNoise(
  x: number,
  y: number,
  seed: number,
  scale: number = 1
): number {
  const xi = Math.floor(x / scale);
  const yi = Math.floor(y / scale);
  const xf = (x / scale) % 1;
  const yf = (y / scale) % 1;

  const n00 = seededRandom(seed + xi * 73 + yi * 79);
  const n10 = seededRandom(seed + (xi + 1) * 73 + yi * 79);
  const n01 = seededRandom(seed + xi * 73 + (yi + 1) * 79);
  const n11 = seededRandom(seed + (xi + 1) * 73 + (yi + 1) * 79);

  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);

  const nx0 = n00 * (1 - u) + n10 * u;
  const nx1 = n01 * (1 - u) + n11 * u;
  return nx0 * (1 - v) + nx1 * v;
}

export function generateBlockTexture(
  blockName: string,
  color: number,
  size: number = 64
): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Base color
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;

  const baseColor = `rgb(${r}, ${g}, ${b})`;
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  const seed = hashCode(blockName) % 1000;

  // Generate noise pattern
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const pixelIndex = i / 4;
    const x = pixelIndex % size;
    const y = Math.floor(pixelIndex / size);

    // Perlin noise for variation
    const noise1 = generatePerlinNoise(x, y, seed, 8);
    const noise2 = generatePerlinNoise(x, y, seed + 1000, 16);
    const noise3 = generatePerlinNoise(x, y, seed + 2000, 32);

    const detail = noise1 * 0.5 + noise2 * 0.25 + noise3 * 0.25;
    const variation = Math.floor(detail * 30) - 15;

    data[i] = Math.max(0, Math.min(255, data[i] + variation)); // R
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + variation)); // G
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + variation)); // B
  }

  // Add edge darkening/vignette
  for (let i = 0; i < data.length; i += 4) {
    const pixelIndex = i / 4;
    const x = pixelIndex % size;
    const y = Math.floor(pixelIndex / size);

    const distX = Math.abs(x - size / 2) / (size / 2);
    const distY = Math.abs(y - size / 2) / (size / 2);
    const dist = Math.max(distX, distY);

    const vignette = 1 - dist * 0.3;

    data[i] *= vignette;
    data[i + 1] *= vignette;
    data[i + 2] *= vignette;
  }

  // Add subtle grid pattern for some blocks
  if (blockName.includes("wood") || blockName.includes("plank")) {
    for (let y = 0; y < size; y += size / 4) {
      for (let x = 0; x < size; x++) {
        const idx = (Math.floor(y) * size + x) * 4;
        data[idx] *= 0.95;
        data[idx + 1] *= 0.95;
        data[idx + 2] *= 0.95;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestMipmapNearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

export function generateMultiFaceTextures(
  blockName: string,
  color: number
): Record<string, THREE.Texture> {
  // For different faces, create subtle variations
  const baseTexture = generateBlockTexture(blockName, color, 64);

  // Top faces are slightly brighter
  const topColor =
    ((Math.min(255, ((color >> 16) & 255) + 20) << 16) |
      (Math.min(255, ((color >> 8) & 255) + 20) << 8) |
      Math.min(255, (color & 255) + 20)) &
    0xffffff;

  // Bottom faces are slightly darker
  const bottomColor =
    ((Math.max(0, ((color >> 16) & 255) - 30) << 16) |
      (Math.max(0, ((color >> 8) & 255) - 30) << 8) |
      Math.max(0, (color & 255) - 30)) &
    0xffffff;

  return {
    top: generateBlockTexture(blockName + "_top", topColor, 64),
    bottom: generateBlockTexture(blockName + "_bottom", bottomColor, 64),
    side: baseTexture,
  };
}
