import type { Region, BlockState } from './litematicParser';

export interface DecodedBlock {
  x: number;
  y: number;
  z: number;
  block: BlockState;
}

const AIR_BLOCKS = new Set([
  'minecraft:air',
  'minecraft:cave_air',
  'minecraft:void_air',
]);

/** Interpret a signed 64-bit bigint as unsigned. */
function asUnsigned(value: bigint): bigint {
  return value < 0n ? value + (1n << 64n) : value;
}

/**
 * Decode packed block states from a region.
 *
 * Litematica stores block indices bit-packed into 64-bit longs.
 * - bitsPerEntry = max(2, ceil(log2(paletteSize)))
 * - Entries can span across long boundaries (pre-1.16 packing style).
 * - Index-to-coordinate mapping: index = y * sizeX * sizeZ + z * sizeX + x
 */
export function decodeBlocks(region: Region): DecodedBlock[] {
  const { size, palette, blockStates } = region;
  const totalBlocks = size.x * size.y * size.z;
  const bitsPerEntry = Math.max(2, Math.ceil(Math.log2(palette.length)));
  const mask = (1n << BigInt(bitsPerEntry)) - 1n;

  const blocks: DecodedBlock[] = [];

  for (let i = 0; i < totalBlocks; i++) {
    const bitIndex = i * bitsPerEntry;
    const longIndex = Math.floor(bitIndex / 64);
    const bitOffset = bitIndex % 64;

    if (longIndex >= blockStates.length) break;

    let value: bigint;

    if (bitOffset + bitsPerEntry > 64 && longIndex + 1 < blockStates.length) {
      // Entry spans two longs
      const lowBits = asUnsigned(blockStates[longIndex]) >> BigInt(bitOffset);
      const highBits =
        asUnsigned(blockStates[longIndex + 1]) << BigInt(64 - bitOffset);
      value = (lowBits | highBits) & mask;
    } else {
      value =
        (asUnsigned(blockStates[longIndex]) >> BigInt(bitOffset)) & mask;
    }

    const paletteIndex = Number(value);
    if (paletteIndex >= palette.length) continue;

    const block = palette[paletteIndex];
    if (AIR_BLOCKS.has(block.name)) continue;

    // Coordinate mapping
    const y = Math.floor(i / (size.x * size.z));
    const remainder = i % (size.x * size.z);
    const z = Math.floor(remainder / size.x);
    const x = remainder % size.x;

    blocks.push({ x, y, z, block });
  }

  return blocks;
}
