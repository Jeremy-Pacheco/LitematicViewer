import { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { DecodedBlock } from "../lib/blockDecoder";

/* ------------------------------------------------------------------ */
/*  Block color map                                                    */
/* ------------------------------------------------------------------ */

const BLOCK_COLORS: Record<string, number> = {
  "minecraft:stone": 0x7d7d7d,
  "minecraft:granite": 0x9a6b4e,
  "minecraft:polished_granite": 0xa37555,
  "minecraft:diorite": 0xbcbcbc,
  "minecraft:polished_diorite": 0xc8c8c8,
  "minecraft:andesite": 0x888888,
  "minecraft:polished_andesite": 0x8e8e8e,
  "minecraft:deepslate": 0x4c4c4e,
  "minecraft:cobbled_deepslate": 0x505052,
  "minecraft:grass_block": 0x5d9b47,
  "minecraft:dirt": 0x866043,
  "minecraft:coarse_dirt": 0x77553b,
  "minecraft:cobblestone": 0x7b7b7b,
  "minecraft:oak_planks": 0xb8945f,
  "minecraft:spruce_planks": 0x6b4d2e,
  "minecraft:birch_planks": 0xc5b77b,
  "minecraft:jungle_planks": 0xa0764a,
  "minecraft:acacia_planks": 0xad5d2b,
  "minecraft:dark_oak_planks": 0x3e2912,
  "minecraft:mangrove_planks": 0x773636,
  "minecraft:cherry_planks": 0xe4b4a4,
  "minecraft:bamboo_planks": 0xc4b357,
  "minecraft:oak_log": 0x6b5339,
  "minecraft:spruce_log": 0x3b2813,
  "minecraft:birch_log": 0xd4cebc,
  "minecraft:jungle_log": 0x584119,
  "minecraft:acacia_log": 0x6a6a6a,
  "minecraft:dark_oak_log": 0x3e2e17,
  "minecraft:sand": 0xdbcfa3,
  "minecraft:red_sand": 0xbe6621,
  "minecraft:gravel": 0x827b7b,
  "minecraft:iron_ore": 0x8a7b6b,
  "minecraft:gold_ore": 0x8f8f73,
  "minecraft:coal_ore": 0x6b6b6b,
  "minecraft:diamond_ore": 0x7bb5b5,
  "minecraft:lapis_ore": 0x6a7ca0,
  "minecraft:redstone_ore": 0x8a5a5a,
  "minecraft:emerald_ore": 0x6a8a6a,
  "minecraft:copper_ore": 0x8a7b6b,
  "minecraft:glass": 0xc0d8ea,
  "minecraft:white_stained_glass": 0xe8e8e8,
  "minecraft:bricks": 0x9b603a,
  "minecraft:stone_bricks": 0x7b7b7b,
  "minecraft:mossy_stone_bricks": 0x6b7b5b,
  "minecraft:cracked_stone_bricks": 0x747474,
  "minecraft:bookshelf": 0x6b5339,
  "minecraft:obsidian": 0x1b1035,
  "minecraft:crying_obsidian": 0x2b1a55,
  "minecraft:water": 0x3f76e4,
  "minecraft:lava": 0xd4610c,
  "minecraft:iron_block": 0xd8d8d8,
  "minecraft:gold_block": 0xf5da25,
  "minecraft:diamond_block": 0x62edd8,
  "minecraft:emerald_block": 0x2dbf4e,
  "minecraft:redstone_block": 0xa81414,
  "minecraft:lapis_block": 0x2347a8,
  "minecraft:copper_block": 0xbf6b3c,
  "minecraft:netherite_block": 0x3c3c3e,
  "minecraft:netherrack": 0x6b3333,
  "minecraft:soul_sand": 0x514133,
  "minecraft:glowstone": 0xab8654,
  "minecraft:nether_bricks": 0x2c1419,
  "minecraft:end_stone": 0xdbde8e,
  "minecraft:end_stone_bricks": 0xd6d99b,
  "minecraft:purpur_block": 0xa97da9,
  "minecraft:prismarine": 0x63a697,
  "minecraft:dark_prismarine": 0x335f4c,
  "minecraft:sea_lantern": 0xaccbc3,
  "minecraft:terracotta": 0x9e6246,
  "minecraft:hay_block": 0xb5970a,
  "minecraft:quartz_block": 0xece5da,
  "minecraft:smooth_quartz": 0xece5da,
  "minecraft:ice": 0x91b4fe,
  "minecraft:packed_ice": 0x7e9efc,
  "minecraft:blue_ice": 0x74a6f7,
  "minecraft:snow_block": 0xfafafa,
  "minecraft:snow": 0xfafafa,
  "minecraft:clay": 0xa0a1ae,
  "minecraft:pumpkin": 0xc87b23,
  "minecraft:melon": 0x699022,
  "minecraft:sponge": 0xc2b94a,
  "minecraft:tnt": 0xdb4343,
  "minecraft:bedrock": 0x555555,
  "minecraft:moss_block": 0x596b2c,
  "minecraft:tuff": 0x6a6a5f,
  "minecraft:calcite": 0xdeddda,
  "minecraft:amethyst_block": 0x8b5cb3,
  "minecraft:dripstone_block": 0x866a54,
  "minecraft:smooth_stone": 0x9e9e9e,
  "minecraft:sandstone": 0xd6cb8b,
  "minecraft:red_sandstone": 0xba6724,
  "minecraft:white_wool": 0xe8e8e8,
  "minecraft:orange_wool": 0xf07613,
  "minecraft:magenta_wool": 0xbd44b3,
  "minecraft:light_blue_wool": 0x3aafd9,
  "minecraft:yellow_wool": 0xf8c527,
  "minecraft:lime_wool": 0x70b919,
  "minecraft:pink_wool": 0xed8dac,
  "minecraft:gray_wool": 0x3e4447,
  "minecraft:light_gray_wool": 0x8e8e86,
  "minecraft:cyan_wool": 0x158991,
  "minecraft:purple_wool": 0x7b2fbe,
  "minecraft:blue_wool": 0x35399d,
  "minecraft:brown_wool": 0x724728,
  "minecraft:green_wool": 0x546d1b,
  "minecraft:red_wool": 0xa12722,
  "minecraft:black_wool": 0x141519,
  "minecraft:white_concrete": 0xcfd5d6,
  "minecraft:orange_concrete": 0xe06101,
  "minecraft:magenta_concrete": 0xa93098,
  "minecraft:light_blue_concrete": 0x2389c7,
  "minecraft:yellow_concrete": 0xf0b10a,
  "minecraft:lime_concrete": 0x5fa818,
  "minecraft:pink_concrete": 0xd6658e,
  "minecraft:gray_concrete": 0x363a3e,
  "minecraft:light_gray_concrete": 0x7d7d73,
  "minecraft:cyan_concrete": 0x157788,
  "minecraft:purple_concrete": 0x641f9c,
  "minecraft:blue_concrete": 0x2c2e96,
  "minecraft:brown_concrete": 0x60381c,
  "minecraft:green_concrete": 0x495b24,
  "minecraft:red_concrete": 0x8e2020,
  "minecraft:black_concrete": 0x080a0f,
};

function getBlockColor(name: string, target: THREE.Color): THREE.Color {
  const hex = BLOCK_COLORS[name];
  if (hex !== undefined) return target.setHex(hex);

  // Fallback pattern matching
  if (name.includes("plank")) return target.setHex(0xb8945f);
  if (name.includes("log") || name.includes("wood") || name.includes("stem"))
    return target.setHex(0x6b5339);
  if (name.includes("stone") || name.includes("cobble"))
    return target.setHex(0x7b7b7b);
  if (name.includes("sand")) return target.setHex(0xdbcfa3);
  if (name.includes("dirt") || name.includes("mud"))
    return target.setHex(0x866043);
  if (name.includes("grass") || name.includes("leaves"))
    return target.setHex(0x5d9b47);
  if (name.includes("ore")) return target.setHex(0x8a7b6b);
  if (name.includes("brick")) return target.setHex(0x9b603a);
  if (name.includes("wool") || name.includes("carpet"))
    return target.setHex(0xe8e8e8);
  if (name.includes("glass") || name.includes("pane"))
    return target.setHex(0xc0d8ea);
  if (name.includes("concrete")) return target.setHex(0xcfd5d6);
  if (name.includes("terracotta")) return target.setHex(0x9e6246);
  if (name.includes("copper")) return target.setHex(0xbf6b3c);
  if (name.includes("deepslate")) return target.setHex(0x4c4c4e);
  if (name.includes("iron")) return target.setHex(0xd8d8d8);
  if (name.includes("gold")) return target.setHex(0xf5da25);
  if (name.includes("nether")) return target.setHex(0x6b3333);
  if (name.includes("prismarine")) return target.setHex(0x63a697);
  if (name.includes("quartz")) return target.setHex(0xece5da);
  if (name.includes("ice") || name.includes("snow"))
    return target.setHex(0x91b4fe);

  // Default gray
  return target.setHex(0xcccccc);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface Viewer3DProps {
  blocks: DecodedBlock[];
}

export default function Viewer3D({ blocks }: Viewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || blocks.length === 0) return;

    // -------- Scene --------
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // -------- Camera --------
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      5000,
    );

    // -------- Renderer --------
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // -------- Lights --------
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(50, 100, 50);
    scene.add(dirLight);

    // -------- Compute bounding box for centering --------
    let minX = Infinity,
      minY = Infinity,
      minZ = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity,
      maxZ = -Infinity;
    for (const b of blocks) {
      if (b.x < minX) minX = b.x;
      if (b.y < minY) minY = b.y;
      if (b.z < minZ) minZ = b.z;
      if (b.x > maxX) maxX = b.x;
      if (b.y > maxY) maxY = b.y;
      if (b.z > maxZ) maxZ = b.z;
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const cz = (minZ + maxZ) / 2;

    // -------- InstancedMesh: one box per non-air block --------
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshLambertMaterial();
    const mesh = new THREE.InstancedMesh(geometry, material, blocks.length);

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    for (let i = 0; i < blocks.length; i++) {
      dummy.position.set(blocks[i].x - cx, blocks[i].y - cy, blocks[i].z - cz);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, getBlockColor(blocks[i].block.name, color));
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    scene.add(mesh);

    // -------- Grid helper --------
    const span = Math.max(maxX - minX, maxY - minY, maxZ - minZ, 1);
    const gridDivisions = Math.min(Math.ceil(span * 2), 200);
    const grid = new THREE.GridHelper(
      span * 2,
      gridDivisions,
      0x444466,
      0x222244,
    );
    grid.position.y = minY - cy - 0.5;
    scene.add(grid);

    // -------- Camera position --------
    camera.position.set(span * 1.2, span * 0.9, span * 1.2);
    camera.lookAt(0, 0, 0);

    // -------- OrbitControls --------
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);

    // -------- Animation loop --------
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // -------- Resize handling --------
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // -------- Cleanup --------
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [blocks]);

  return <div ref={containerRef} className="viewer-3d" />;
}
