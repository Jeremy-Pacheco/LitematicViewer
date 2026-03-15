import JSZip from "jszip";
import type { BlockState } from "./litematicParser";

export interface LoadedResourcePack {
  name: string;
  textures: Record<string, string>;
}

export interface BlockFaceTextureUrls {
  right?: string;
  left?: string;
  top?: string;
  bottom?: string;
  front?: string;
  back?: string;
}

const TEXTURE_PREFIX = "assets/minecraft/textures/";

function normalizePath(path: string): string {
  return path.replaceAll("\\", "/").toLowerCase();
}

function extractTextureKey(path: string): string | null {
  const normalized = normalizePath(path);
  const marker = normalized.indexOf(TEXTURE_PREFIX);
  if (marker === -1 || !normalized.endsWith(".png")) return null;

  const relative = normalized.slice(marker + TEXTURE_PREFIX.length);
  return relative.slice(0, -4);
}

function pickTextureUrl(
  pack: LoadedResourcePack,
  candidates: string[],
): string | undefined {
  for (const candidate of candidates) {
    const url = pack.textures[candidate];
    if (url) return url;
  }
  return undefined;
}

function asMinecraftName(name: string): string {
  return name.startsWith("minecraft:") ? name.slice("minecraft:".length) : name;
}

function getTextureCandidatesForName(name: string): string[] {
  const direct = [`block/${name}`];

  if (name.endsWith("_stairs") || name.endsWith("_slab")) {
    const base = name.replace(/_(stairs|slab)$/, "");
    return [
      ...direct,
      `block/${base}`,
      `block/${base}s`,
      `block/${base}_planks`,
      `block/${base}_block`,
      `block/${base}_top`,
      `block/${base}_side`,
    ];
  }

  return [
    ...direct,
    `block/${name}_top`,
    `block/${name}_side`,
    `block/${name}_end`,
  ];
}

export async function loadResourcePack(
  arrayBuffer: ArrayBuffer,
  fileName: string,
): Promise<LoadedResourcePack> {
  const zip = await JSZip.loadAsync(arrayBuffer);
  const textures: Record<string, string> = {};

  const entries = Object.values(zip.files).filter((entry) => !entry.dir);
  for (const entry of entries) {
    const textureKey = extractTextureKey(entry.name);
    if (!textureKey) continue;

    const blob = await entry.async("blob");
    textures[textureKey] = URL.createObjectURL(blob);
  }

  return { name: fileName, textures };
}

export function disposeResourcePack(pack: LoadedResourcePack | null): void {
  if (!pack) return;
  for (const url of Object.values(pack.textures)) {
    URL.revokeObjectURL(url);
  }
}

export function resolveBlockFaceTextureUrls(
  block: BlockState,
  pack: LoadedResourcePack,
): BlockFaceTextureUrls | null {
  const name = asMinecraftName(block.name);
  const axis = block.properties?.axis;

  if (name === "grass_block") {
    const top = pickTextureUrl(pack, ["block/grass_block_top"]);
    const bottom = pickTextureUrl(pack, ["block/dirt"]);
    const side = pickTextureUrl(pack, ["block/grass_block_side"]);
    if (!top && !bottom && !side) return null;
    return {
      right: side,
      left: side,
      top,
      bottom,
      front: side,
      back: side,
    };
  }

  if (name === "dirt_path") {
    const top = pickTextureUrl(pack, ["block/dirt_path_top"]);
    const bottom = pickTextureUrl(pack, ["block/dirt"]);
    const side = pickTextureUrl(pack, ["block/dirt_path_side"]);
    if (!top && !bottom && !side) return null;
    return {
      right: side,
      left: side,
      top,
      bottom,
      front: side,
      back: side,
    };
  }

  if (
    name.endsWith("_log") ||
    name.endsWith("_stem") ||
    name.endsWith("_block")
  ) {
    const side = pickTextureUrl(pack, [
      `block/${name}`,
      `block/${name}_side`,
    ]);
    const end = pickTextureUrl(pack, [`block/${name}_top`, `block/${name}_end`]);

    if ((name.endsWith("_log") || name.endsWith("_stem")) && (side || end)) {
      if (axis === "x") {
        return {
          right: end,
          left: end,
          top: side,
          bottom: side,
          front: side,
          back: side,
        };
      }
      if (axis === "z") {
        return {
          right: side,
          left: side,
          top: side,
          bottom: side,
          front: end,
          back: end,
        };
      }
      return {
        right: side,
        left: side,
        top: end,
        bottom: end,
        front: side,
        back: side,
      };
    }

    const all = side ?? end;
    if (!all) return null;
    return {
      right: all,
      left: all,
      top: all,
      bottom: all,
      front: all,
      back: all,
    };
  }

  const all = pickTextureUrl(pack, getTextureCandidatesForName(name));

  if (!all) return null;

  return {
    right: all,
    left: all,
    top: all,
    bottom: all,
    front: all,
    back: all,
  };
}
