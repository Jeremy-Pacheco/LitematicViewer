import { Buffer } from "buffer";
import pako from "pako";
import nbt from "prismarine-nbt";

// Buffer polyfill for prismarine-nbt in the browser.
// Must run before prismarine-nbt accesses Buffer at parse time.
if (typeof globalThis.Buffer === "undefined") {
  globalThis.Buffer = Buffer as unknown as typeof globalThis.Buffer;
}

export interface BlockState {
  name: string;
  properties?: Record<string, string>;
}

export interface Region {
  name: string;
  size: { x: number; y: number; z: number };
  position: { x: number; y: number; z: number };
  palette: BlockState[];
  blockStates: bigint[];
}

export interface LitematicData {
  regions: Region[];
}

/**
 * Convert prismarine-nbt long arrays to bigint[].
 * prismarine-nbt may return either bigint[] or [high, low][] pairs
 * depending on the version.
 */
function toLongArray(raw: unknown[]): bigint[] {
  if (raw.length === 0) return [];
  if (typeof raw[0] === "bigint") return raw as bigint[];
  // [high: number, low: number][] format
  return (raw as [number, number][]).map(
    ([high, low]) => (BigInt(high) << 32n) | BigInt(low >>> 0),
  );
}

/**
 * Parse a .litematic file from an ArrayBuffer.
 *
 * Steps:
 * 1. Decompress gzip with pako
 * 2. Parse NBT with prismarine-nbt
 * 3. Extract Regions → Size, Position, BlockStatePalette, BlockStates
 */
export async function parseLitematic(
  arrayBuffer: ArrayBuffer,
): Promise<LitematicData> {
  // 1. Decompress gzip
  const compressed = new Uint8Array(arrayBuffer);
  const decompressed = pako.inflate(compressed);

  // 2. Parse NBT
  const buffer = Buffer.from(decompressed);
  const { parsed } = await nbt.parse(buffer);

  // 3. Navigate the NBT tree
  // Root → Regions compound → each region compound
  const root = parsed.value as Record<string, any>;
  const regionsCompound = root.Regions;

  if (!regionsCompound) {
    throw new Error("Invalid .litematic: no Regions compound found");
  }

  const regions: Region[] = [];
  const regionsValue = regionsCompound.value as Record<string, any>;

  for (const [name, regionTag] of Object.entries(regionsValue)) {
    const region = (regionTag as any).value;

    // Size can be negative (indicates direction), so take abs
    const sizeTag = region.Size.value;
    const size = {
      x: Math.abs(sizeTag.x.value),
      y: Math.abs(sizeTag.y.value),
      z: Math.abs(sizeTag.z.value),
    };

    const posTag = region.Position.value;
    const position = {
      x: posTag.x.value,
      y: posTag.y.value,
      z: posTag.z.value,
    };

    // BlockStatePalette: list → { type:'compound', value: [...] }
    const paletteEntries = region.BlockStatePalette.value.value as any[];
    const palette: BlockState[] = paletteEntries.map((entry: any) => ({
      name: entry.Name.value as string,
      properties: entry.Properties
        ? Object.fromEntries(
            Object.entries(entry.Properties.value as Record<string, any>).map(
              ([k, v]: [string, any]) => [k, v.value as string],
            ),
          )
        : undefined,
    }));

    // BlockStates: longArray
    const blockStates = toLongArray(region.BlockStates.value);

    regions.push({ name, size, position, palette, blockStates });
  }

  return { regions };
}
