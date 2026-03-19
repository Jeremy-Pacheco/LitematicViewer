import { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { DecodedBlock } from "../lib/blockDecoder";
import {
  resolveBlockFaceTextureUrls,
  type LoadedResourcePack,
} from "../lib/resourcePack";
import { generateBlockTexture } from "../lib/textureGenerator";

/* ------------------------------------------------------------------ */
/*  Block color map                                                    */
/* ------------------------------------------------------------------ */

const BLOCK_COLORS: Record<string, number> = {
  // Stones
  "minecraft:stone": 0x7d7d7d,
  "minecraft:granite": 0x9a6b4e,
  "minecraft:polished_granite": 0xa37555,
  "minecraft:diorite": 0xbcbcbc,
  "minecraft:polished_diorite": 0xc8c8c8,
  "minecraft:andesite": 0x888888,
  "minecraft:polished_andesite": 0x8e8e8e,
  "minecraft:deepslate": 0x4c4c4e,
  "minecraft:cobbled_deepslate": 0x505052,
  "minecraft:polished_deepslate": 0x4f4f53,
  "minecraft:deepslate_bricks": 0x505052,
  "minecraft:deepslate_tiles": 0x484850,
  "minecraft:tuff": 0x6a6a5f,
  "minecraft:calcite": 0xdeddda,
  
  // Dirt & Grass
  "minecraft:grass_block": 0x5d9b47,
  "minecraft:dirt": 0x866043,
  "minecraft:coarse_dirt": 0x77553b,
  "minecraft:dirt_path": 0x9d8659,
  "minecraft:rooted_dirt": 0x7a5c3a,
  "minecraft:mud": 0x5a4a35,
  "minecraft:muddy_mangrove_roots": 0x4a3a2a,
  "minecraft:moss_block": 0x596b2c,
  "minecraft:moss_carpet": 0x6b7d3a,
  
  // Stone variants
  "minecraft:cobblestone": 0x7b7b7b,
  "minecraft:mossy_cobblestone": 0x6b7b5b,
  "minecraft:stone_bricks": 0x7b7b7b,
  "minecraft:mossy_stone_bricks": 0x6b7b5b,
  "minecraft:cracked_stone_bricks": 0x747474,
  "minecraft:chiseled_stone_bricks": 0x7a7a7a,
  
  // Wood & Planks
  "minecraft:oak_planks": 0xb8945f,
  "minecraft:spruce_planks": 0x6b4d2e,
  "minecraft:birch_planks": 0xc5b77b,
  "minecraft:jungle_planks": 0xa0764a,
  "minecraft:acacia_planks": 0xad5d2b,
  "minecraft:dark_oak_planks": 0x3e2912,
  "minecraft:mangrove_planks": 0x773636,
  "minecraft:cherry_planks": 0xe4b4a4,
  "minecraft:bamboo_planks": 0xc4b357,
  "minecraft:pale_oak_planks": 0xc9b89b,
  
  "minecraft:oak_log": 0x6b5339,
  "minecraft:spruce_log": 0x3b2813,
  "minecraft:birch_log": 0xd4cebc,
  "minecraft:jungle_log": 0x584119,
  "minecraft:acacia_log": 0x6a6a6a,
  "minecraft:dark_oak_log": 0x3e2e17,
  "minecraft:mangrove_log": 0x643a3a,
  "minecraft:cherry_log": 0xb58373,
  "minecraft:bamboo_block": 0xc4b357,
  "minecraft:pale_oak_log": 0x7d6b5d,
  
  "minecraft:oak_wood": 0x6b5339,
  "minecraft:spruce_wood": 0x3b2813,
  "minecraft:birch_wood": 0xd4cebc,
  "minecraft:jungle_wood": 0x584119,
  "minecraft:acacia_wood": 0x6a6a6a,
  "minecraft:dark_oak_wood": 0x3e2e17,
  "minecraft:mangrove_wood": 0x643a3a,
  "minecraft:cherry_wood": 0xb58373,
  "minecraft:pale_oak_wood": 0x7d6b5d,
  
  "minecraft:oak_leaves": 0x5d9b47,
  "minecraft:spruce_leaves": 0x4a6b2b,
  "minecraft:birch_leaves": 0x8fb34a,
  "minecraft:jungle_leaves": 0x5d9b47,
  "minecraft:acacia_leaves": 0x8fb34a,
  "minecraft:dark_oak_leaves": 0x4a6b2b,
  "minecraft:mangrove_leaves": 0x5d7b47,
  "minecraft:cherry_leaves": 0xff8fb3,
  "minecraft:pale_oak_leaves": 0x8fb34a,
  
  // Sands & Gravels
  "minecraft:sand": 0xdbcfa3,
  "minecraft:red_sand": 0xbe6621,
  "minecraft:gravel": 0x827b7b,
  
  // Ores
  "minecraft:coal_ore": 0x6b6b6b,
  "minecraft:iron_ore": 0x8a7b6b,
  "minecraft:copper_ore": 0x8a7b6b,
  "minecraft:gold_ore": 0x8f8f73,
  "minecraft:diamond_ore": 0x7bb5b5,
  "minecraft:emerald_ore": 0x6a8a6a,
  "minecraft:lapis_ore": 0x6a7ca0,
  "minecraft:redstone_ore": 0x8a5a5a,
  "minecraft:deepslate_coal_ore": 0x505050,
  "minecraft:deepslate_iron_ore": 0x5a5050,
  "minecraft:deepslate_copper_ore": 0x6a5b4b,
  "minecraft:deepslate_gold_ore": 0x5a5a48,
  "minecraft:deepslate_diamond_ore": 0x4a8a8a,
  "minecraft:deepslate_emerald_ore": 0x4a6a4a,
  "minecraft:deepslate_lapis_ore": 0x4a5a80,
  "minecraft:deepslate_redstone_ore": 0x6a3a3a,
  
  // Metals & Blocks
  "minecraft:iron_block": 0xd8d8d8,
  "minecraft:copper_block": 0xbf6b3c,
  "minecraft:gold_block": 0xf5da25,
  "minecraft:diamond_block": 0x62edd8,
  "minecraft:emerald_block": 0x2dbf4e,
  "minecraft:lapis_block": 0x2347a8,
  "minecraft:netherite_block": 0x3c3c3e,
  "minecraft:exposed_copper": 0xaa8a5a,
  "minecraft:weathered_copper": 0x6aa87a,
  "minecraft:oxidized_copper": 0x4a8a8a,
  "minecraft:cut_copper": 0xbf6b3c,
  "minecraft:cut_copper_stairs": 0xbf6b3c,
  "minecraft:cut_copper_slab": 0xbf6b3c,
  
  // Glass
  "minecraft:glass": 0xc0d8ea,
  "minecraft:white_stained_glass": 0xe8e8e8,
  "minecraft:orange_stained_glass": 0xf07613,
  "minecraft:magenta_stained_glass": 0xbd44b3,
  "minecraft:light_blue_stained_glass": 0x3aafd9,
  "minecraft:yellow_stained_glass": 0xf8c527,
  "minecraft:lime_stained_glass": 0x70b919,
  "minecraft:pink_stained_glass": 0xed8dac,
  "minecraft:gray_stained_glass": 0x3e4447,
  "minecraft:light_gray_stained_glass": 0x8e8e86,
  "minecraft:cyan_stained_glass": 0x158991,
  "minecraft:purple_stained_glass": 0x7b2fbe,
  "minecraft:blue_stained_glass": 0x35399d,
  "minecraft:brown_stained_glass": 0x724728,
  "minecraft:green_stained_glass": 0x546d1b,
  "minecraft:red_stained_glass": 0xa12722,
  "minecraft:black_stained_glass": 0x141519,
  
  // Glass Panes
  "minecraft:glass_pane": 0xc0d8ea,
  "minecraft:white_stained_glass_pane": 0xe8e8e8,
  "minecraft:orange_stained_glass_pane": 0xf07613,
  "minecraft:magenta_stained_glass_pane": 0xbd44b3,
  "minecraft:light_blue_stained_glass_pane": 0x3aafd9,
  "minecraft:yellow_stained_glass_pane": 0xf8c527,
  "minecraft:lime_stained_glass_pane": 0x70b919,
  "minecraft:pink_stained_glass_pane": 0xed8dac,
  "minecraft:gray_stained_glass_pane": 0x3e4447,
  "minecraft:light_gray_stained_glass_pane": 0x8e8e86,
  "minecraft:cyan_stained_glass_pane": 0x158991,
  "minecraft:purple_stained_glass_pane": 0x7b2fbe,
  "minecraft:blue_stained_glass_pane": 0x35399d,
  "minecraft:brown_stained_glass_pane": 0x724728,
  "minecraft:green_stained_glass_pane": 0x546d1b,
  "minecraft:red_stained_glass_pane": 0xa12722,
  "minecraft:black_stained_glass_pane": 0x141519,
  
  // Wool (all colors)
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
  
  // Concrete (all colors)
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
  
  // Concrete Powder
  "minecraft:white_concrete_powder": 0xe5dfd6,
  "minecraft:orange_concrete_powder": 0xf0b894,
  "minecraft:magenta_concrete_powder": 0xc89ac0,
  "minecraft:light_blue_concrete_powder": 0x8ec5de,
  "minecraft:yellow_concrete_powder": 0xf5d589,
  "minecraft:lime_concrete_powder": 0xb5d648,
  "minecraft:pink_concrete_powder": 0xe5a8c0,
  "minecraft:gray_concrete_powder": 0x696b6e,
  "minecraft:light_gray_concrete_powder": 0xb8b8b0,
  "minecraft:cyan_concrete_powder": 0x6eb5c4,
  "minecraft:purple_concrete_powder": 0x9876b8,
  "minecraft:blue_concrete_powder": 0x6c70b8,
  "minecraft:brown_concrete_powder": 0x9d7254,
  "minecraft:green_concrete_powder": 0x88945c,
  "minecraft:red_concrete_powder": 0xc46464,
  "minecraft:black_concrete_powder": 0x3c3c3c,
  
  // Terracotta (all colors)
  "minecraft:terracotta": 0x9e6246,
  "minecraft:white_terracotta": 0xc9b8b0,
  "minecraft:orange_terracotta": 0xc85a28,
  "minecraft:magenta_terracotta": 0xa84d6e,
  "minecraft:light_blue_terracotta": 0x7589a2,
  "minecraft:yellow_terracotta": 0xc9a846,
  "minecraft:lime_terracotta": 0x79924a,
  "minecraft:pink_terracotta": 0xb87878,
  "minecraft:gray_terracotta": 0x4c4843,
  "minecraft:light_gray_terracotta": 0xa08778,
  "minecraft:cyan_terracotta": 0x607a7f,
  "minecraft:purple_terracotta": 0x7f4948,
  "minecraft:blue_terracotta": 0x5d5a7d,
  "minecraft:brown_terracotta": 0x5d4a42,
  "minecraft:green_terracotta": 0x6b7c42,
  "minecraft:red_terracotta": 0x9e5f52,
  "minecraft:black_terracotta": 0x3a3228,
  
  // Glazed Terracotta (all colors)
  "minecraft:white_glazed_terracotta": 0xe5dcd6,
  "minecraft:orange_glazed_terracotta": 0xe8a844,
  "minecraft:magenta_glazed_terracotta": 0xc85a8a,
  "minecraft:light_blue_glazed_terracotta": 0x7db8d4,
  "minecraft:yellow_glazed_terracotta": 0xf0d050,
  "minecraft:lime_glazed_terracotta": 0xa0c844,
  "minecraft:pink_glazed_terracotta": 0xe8a8d4,
  "minecraft:gray_glazed_terracotta": 0x7d7d7d,
  "minecraft:light_gray_glazed_terracotta": 0xc0c0b0,
  "minecraft:cyan_glazed_terracotta": 0x8ab0c4,
  "minecraft:purple_glazed_terracotta": 0xa878a0,
  "minecraft:blue_glazed_terracotta": 0x7d7db8,
  "minecraft:brown_glazed_terracotta": 0xa88470,
  "minecraft:green_glazed_terracotta": 0xa0b060,
  "minecraft:red_glazed_terracotta": 0xe87070,
  "minecraft:black_glazed_terracotta": 0x4a4a4a,
  
  // Nether
  "minecraft:netherrack": 0x6b3333,
  "minecraft:nether_bricks": 0x2c1419,
  "minecraft:red_nether_bricks": 0x742924,
  "minecraft:soul_sand": 0x514133,
  "minecraft:soul_soil": 0x6b5d47,
  "minecraft:crimson_nylium": 0x8f3f4a,
  "minecraft:warped_nylium": 0x3f8f8f,
  "minecraft:crimson_planks": 0x813a3d,
  "minecraft:warped_planks": 0x314a56,
  "minecraft:crimson_stem": 0x5a3a3a,
  "minecraft:warped_stem": 0x3a5a5a,
  "minecraft:crimson_hyphae": 0x6b4a4a,
  "minecraft:warped_hyphae": 0x4a6b6b,
  "minecraft:nether_wart_block": 0x8b2e2e,
  "minecraft:warped_wart_block": 0x1f6b6f,
  "minecraft:shroomlight": 0xffb649,
  
  // End
  "minecraft:end_stone": 0xdbde8e,
  "minecraft:end_stone_bricks": 0xd6d99b,
  "minecraft:purpur_block": 0xa97da9,
  "minecraft:purpur_pillar": 0xa97da9,
  "minecraft:purpur_stairs": 0xa97da9,
  "minecraft:purpur_slab": 0xa97da9,
  "minecraft:end_rod": 0xf0e6ff,
  "minecraft:chorus_flower": 0x9f5fa9,
  "minecraft:chorus_plant": 0x7a4a7a,
  
  // Prismarine
  "minecraft:prismarine": 0x63a697,
  "minecraft:dark_prismarine": 0x335f4c,
  "minecraft:prismarine_bricks": 0x6ab8a3,
  "minecraft:sea_lantern": 0xaccbc3,
  
  // Special
  "minecraft:bookshelf": 0x6b5339,
  "minecraft:obsidian": 0x1b1035,
  "minecraft:crying_obsidian": 0x2b1a55,
  "minecraft:water": 0x3f76e4,
  "minecraft:lava": 0xd4610c,
  "minecraft:ice": 0x91b4fe,
  "minecraft:packed_ice": 0x7e9efc,
  "minecraft:blue_ice": 0x74a6f7,
  "minecraft:snow_block": 0xfafafa,
  "minecraft:hay_block": 0xb5970a,
  "minecraft:quartz_block": 0xece5da,
  "minecraft:smooth_quartz": 0xece5da,
  "minecraft:quartz_pillar": 0xece5da,
  "minecraft:quartz_stairs": 0xece5da,
  "minecraft:clay": 0xa0a1ae,
  "minecraft:pumpkin": 0xc87b23,
  "minecraft:melon": 0x699022,
  "minecraft:sponge": 0xc2b94a,
  "minecraft:wet_sponge": 0xa89a3a,
  "minecraft:tnt": 0xdb4343,
  "minecraft:bedrock": 0x555555,
  
  // Vegetation
  "minecraft:seagrass": 0x4a8a4a,
  "minecraft:tall_seagrass": 0x4a8a4a,
  "minecraft:kelp": 0x4a7a4a,
  "minecraft:kelp_plant": 0x4a7a4a,
  "minecraft:sea_pickle": 0x8ab849,
  "minecraft:dead_bush": 0x9d8659,
  "minecraft:sugar_cane": 0x7a9d3a,
  "minecraft:dragon_egg": 0x1a1a2e,
  "minecraft:cocoa": 0x8b6f47,
  
  // Brick
  "minecraft:bricks": 0x9b603a,
  "minecraft:dark_prismarine_stairs": 0x335f4c,
  
  // Redstone
  "minecraft:torch": 0x8b0000,
  "minecraft:redstone_torch": 0xff5500,
  "minecraft:soul_torch": 0x00ccff,
  "minecraft:redstone_wire": 0xcc0000,
  "minecraft:redstone": 0xcc0000,
  "minecraft:redstone_block": 0xcc0000,
  "minecraft:chest": 0x8b6f47,
  "minecraft:trapped_chest": 0x7d5a3a,
  "minecraft:dispenser": 0x8b8b8b,
  "minecraft:dropper": 0x8b8b8b,
  "minecraft:observer": 0x6b6b5f,
  "minecraft:repeater": 0x7d4c4c,
  "minecraft:comparator": 0x7d4c4c,
  "minecraft:lever": 0x8b6f47,
  "minecraft:redstone_lamp": 0xdba520,
  "minecraft:campfire": 0x8b4513,
  "minecraft:soul_campfire": 0x4d7a8f,
  "minecraft:lantern": 0xb8860b,
  "minecraft:soul_lantern": 0x4d7a8f,
  "minecraft:amethyst_cluster": 0x9966ff,
  "minecraft:small_amethyst_bud": 0x9966ff,
  "minecraft:medium_amethyst_bud": 0x9966ff,
  "minecraft:large_amethyst_bud": 0x9966ff,
  "minecraft:amethyst_block": 0x8b5cb3,
  "minecraft:dripstone_block": 0x866a54,
  
  // Signs
  "minecraft:oak_sign": 0xb8945f,
  "minecraft:spruce_sign": 0x6b4d2e,
  "minecraft:birch_sign": 0xc5b77b,
  "minecraft:jungle_sign": 0xa0764a,
  "minecraft:acacia_sign": 0xad5d2b,
  "minecraft:dark_oak_sign": 0x3e2912,
  "minecraft:mangrove_sign": 0x773636,
  "minecraft:cherry_sign": 0xe4b4a4,
  "minecraft:bamboo_sign": 0xc4b357,
  "minecraft:pale_oak_sign": 0xc9b89b,
  
  // Wall Signs
  "minecraft:oak_wall_sign": 0xb8945f,
  "minecraft:spruce_wall_sign": 0x6b4d2e,
  "minecraft:birch_wall_sign": 0xc5b77b,
  "minecraft:jungle_wall_sign": 0xa0764a,
  "minecraft:acacia_wall_sign": 0xad5d2b,
  "minecraft:dark_oak_wall_sign": 0x3e2912,
  "minecraft:mangrove_wall_sign": 0x773636,
  "minecraft:cherry_wall_sign": 0xe4b4a4,
  "minecraft:bamboo_wall_sign": 0xc4b357,
  "minecraft:pale_oak_wall_sign": 0xc9b89b,
  
  // Hanging Signs
  "minecraft:oak_hanging_sign": 0xb8945f,
  "minecraft:spruce_hanging_sign": 0x6b4d2e,
  "minecraft:birch_hanging_sign": 0xc5b77b,
  "minecraft:jungle_hanging_sign": 0xa0764a,
  "minecraft:acacia_hanging_sign": 0xad5d2b,
  "minecraft:dark_oak_hanging_sign": 0x3e2912,
  "minecraft:mangrove_hanging_sign": 0x773636,
  "minecraft:cherry_hanging_sign": 0xe4b4a4,
  "minecraft:bamboo_hanging_sign": 0xc4b357,
  "minecraft:pale_oak_hanging_sign": 0xc9b89b,
  
  // Doors
  "minecraft:oak_door": 0xb8945f,
  "minecraft:spruce_door": 0x6b4d2e,
  "minecraft:birch_door": 0xc5b77b,
  "minecraft:jungle_door": 0xa0764a,
  "minecraft:acacia_door": 0xad5d2b,
  "minecraft:dark_oak_door": 0x3e2912,
  "minecraft:mangrove_door": 0x773636,
  "minecraft:cherry_door": 0xe4b4a4,
  "minecraft:bamboo_door": 0xc4b357,
  "minecraft:pale_oak_door": 0xc9b89b,
  "minecraft:iron_door": 0xd8d8d8,
  
  // Trapdoors
  "minecraft:oak_trapdoor": 0xb8945f,
  "minecraft:spruce_trapdoor": 0x6b4d2e,
  "minecraft:birch_trapdoor": 0xc5b77b,
  "minecraft:jungle_trapdoor": 0xa0764a,
  "minecraft:acacia_trapdoor": 0xad5d2b,
  "minecraft:dark_oak_trapdoor": 0x3e2912,
  "minecraft:mangrove_trapdoor": 0x773636,
  "minecraft:cherry_trapdoor": 0xe4b4a4,
  "minecraft:bamboo_trapdoor": 0xc4b357,
  "minecraft:pale_oak_trapdoor": 0xc9b89b,
  "minecraft:iron_trapdoor": 0xd8d8d8,
  
  // Stairs
  "minecraft:oak_stairs": 0xb8945f,
  "minecraft:spruce_stairs": 0x6b4d2e,
  "minecraft:birch_stairs": 0xc5b77b,
  "minecraft:jungle_stairs": 0xa0764a,
  "minecraft:acacia_stairs": 0xad5d2b,
  "minecraft:dark_oak_stairs": 0x3e2912,
  "minecraft:mangrove_stairs": 0x773636,
  "minecraft:cherry_stairs": 0xe4b4a4,
  "minecraft:bamboo_stairs": 0xc4b357,
  "minecraft:pale_oak_stairs": 0xc9b89b,
  "minecraft:stone_stairs": 0x7b7b7b,
  "minecraft:cobblestone_stairs": 0x7b7b7b,
  "minecraft:mossy_cobblestone_stairs": 0x6b7b5b,
  "minecraft:stone_brick_stairs": 0x7b7b7b,
  "minecraft:mossy_stone_brick_stairs": 0x6b7b5b,
  "minecraft:deepslate_brick_stairs": 0x505052,
  "minecraft:deepslate_tile_stairs": 0x484850,
  "minecraft:brick_stairs": 0x9b603a,
  "minecraft:sandstone_stairs": 0xd6cb8b,
  "minecraft:red_sandstone_stairs": 0xba6724,
  "minecraft:nether_brick_stairs": 0x2c1419,
  "minecraft:red_nether_brick_stairs": 0x742924,
  "minecraft:prismarine_stairs": 0x63a697,
  "minecraft:prismarine_brick_stairs": 0x6ab8a3,
  "minecraft:end_stone_brick_stairs": 0xd6d99b,
  "minecraft:blackstone_stairs": 0x3a3a3a,
  "minecraft:polished_blackstone_stairs": 0x4a4a4a,
  "minecraft:polished_blackstone_brick_stairs": 0x4a4a4a,
  "minecraft:warped_stairs": 0x314a56,
  "minecraft:crimson_stairs": 0x813a3d,
  
  // Slabs
  "minecraft:oak_slab": 0xb8945f,
  "minecraft:spruce_slab": 0x6b4d2e,
  "minecraft:birch_slab": 0xc5b77b,
  "minecraft:jungle_slab": 0xa0764a,
  "minecraft:acacia_slab": 0xad5d2b,
  "minecraft:dark_oak_slab": 0x3e2912,
  "minecraft:mangrove_slab": 0x773636,
  "minecraft:cherry_slab": 0xe4b4a4,
  "minecraft:bamboo_slab": 0xc4b357,
  "minecraft:pale_oak_slab": 0xc9b89b,
  "minecraft:stone_slab": 0x7b7b7b,
  "minecraft:cobblestone_slab": 0x7b7b7b,
  "minecraft:mossy_cobblestone_slab": 0x6b7b5b,
  "minecraft:stone_brick_slab": 0x7b7b7b,
  "minecraft:mossy_stone_brick_slab": 0x6b7b5b,
  "minecraft:deepslate_brick_slab": 0x505052,
  "minecraft:deepslate_tile_slab": 0x484850,
  "minecraft:brick_slab": 0x9b603a,
  "minecraft:sandstone_slab": 0xd6cb8b,
  "minecraft:red_sandstone_slab": 0xba6724,
  "minecraft:nether_brick_slab": 0x2c1419,
  "minecraft:red_nether_brick_slab": 0x742924,
  "minecraft:prismarine_slab": 0x63a697,
  "minecraft:prismarine_brick_slab": 0x6ab8a3,
  "minecraft:dark_prismarine_slab": 0x335f4c,
  "minecraft:quartz_slab": 0xece5da,
  "minecraft:end_stone_brick_slab": 0xd6d99b,
  "minecraft:blackstone_slab": 0x3a3a3a,
  "minecraft:polished_blackstone_slab": 0x4a4a4a,
  "minecraft:polished_blackstone_brick_slab": 0x4a4a4a,
  "minecraft:warped_slab": 0x314a56,
  "minecraft:crimson_slab": 0x813a3d,
  
  // Fences
  "minecraft:oak_fence": 0xb8945f,
  "minecraft:spruce_fence": 0x6b4d2e,
  "minecraft:birch_fence": 0xc5b77b,
  "minecraft:jungle_fence": 0xa0764a,
  "minecraft:acacia_fence": 0xad5d2b,
  "minecraft:dark_oak_fence": 0x3e2912,
  "minecraft:mangrove_fence": 0x773636,
  "minecraft:cherry_fence": 0xe4b4a4,
  "minecraft:bamboo_fence": 0xc4b357,
  "minecraft:pale_oak_fence": 0xc9b89b,
  "minecraft:nether_brick_fence": 0x2c1419,
  "minecraft:blackstone_wall": 0x3a3a3a,
  "minecraft:polished_blackstone_wall": 0x4a4a4a,
  "minecraft:polished_blackstone_brick_wall": 0x4a4a4a,
  
  // Fence Gates
  "minecraft:oak_fence_gate": 0xb8945f,
  "minecraft:spruce_fence_gate": 0x6b4d2e,
  "minecraft:birch_fence_gate": 0xc5b77b,
  "minecraft:jungle_fence_gate": 0xa0764a,
  "minecraft:acacia_fence_gate": 0xad5d2b,
  "minecraft:dark_oak_fence_gate": 0x3e2912,
  "minecraft:mangrove_fence_gate": 0x773636,
  "minecraft:cherry_fence_gate": 0xe4b4a4,
  "minecraft:bamboo_fence_gate": 0xc4b357,
  "minecraft:pale_oak_fence_gate": 0xc9b89b,
  
  // Rails
  "minecraft:rail": 0x8a8a8a,
  "minecraft:powered_rail": 0xd4a844,
  "minecraft:detector_rail": 0x9e6b3a,
  "minecraft:activator_rail": 0xcc4400,

  // Doors & Trapdoors Metal
  "minecraft:iron_bars": 0xd8d8d8,
  
  // Chains & Heavy Objects
  "minecraft:chain": 0x8a8a8a,
  "minecraft:heavy_weighted_pressure_plate": 0xf5da25,
  "minecraft:light_weighted_pressure_plate": 0xf5da25,
  
  // Bells & Special
  "minecraft:bell": 0xf5da25,
  "minecraft:grindstone": 0x6b6b6b,
  "minecraft:smithing_table": 0x7d5a3a,
  "minecraft:cartography_table": 0xb8945f,
  "minecraft:fletching_table": 0xb8945f,
  "minecraft:barrel": 0x8b6f47,
  "minecraft:blast_furnace": 0x6b6b6b,
  "minecraft:furnace": 0x6b6b6b,
  "minecraft:smoker": 0x6b6b6b,
  "minecraft:brewing_stand": 0x8b0000,
  "minecraft:cauldron": 0x5a5a5a,
  "minecraft:water_cauldron": 0x3f76e4,
  "minecraft:lava_cauldron": 0xd4610c,
  "minecraft:powder_snow_cauldron": 0xf5f5f5,
  "minecraft:enchanting_table": 0x001a33,
  "minecraft:end_portal_frame": 0x2a1a3a,
  "minecraft:end_portal": 0x001a0a,
  "minecraft:nether_portal": 0x4a1a6a,
  "minecraft:beacon": 0xc0d8ea,
  "minecraft:conduit": 0x63a697,
  "minecraft:jukeboxe": 0x6b5339,
  "minecraft:jukebox": 0x6b5339,
  "minecraft:sculk": 0x1a3a2a,
  "minecraft:sculk_catalyst": 0x1a3a2a,
  "minecraft:sculk_shrieker": 0x1a3a2a,
  "minecraft:sculk_sensor": 0x1a3a2a,
  "minecraft:calibrated_sculk_sensor": 0x1a3a2a,
  "minecraft:sculk_vein": 0x1a3a2a,
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

function getMaterialFlags(blockName: string): {
  transparent: boolean;
  opacity: number;
  alphaTest: number;
  depthWrite: boolean;
} {
  const name = blockName.replace("minecraft:", "");

  // True translucent blocks should be rendered in transparent pass.
  const isTranslucent =
    name.includes("glass") ||
    name.includes("pane") ||
    name.includes("water") ||
    name.includes("ice");

  // Alpha-cutout blocks keep depthWrite to avoid popping/sorting issues.
  const isCutout =
    name.includes("leaves") ||
    name.includes("vine") ||
    name.includes("grass") ||
    name.includes("fern") ||
    name.includes("torch") ||
    name.includes("rail") ||
    name.includes("redstone_wire") ||
    name.includes("chain");

  if (isTranslucent) {
    return {
      transparent: true,
      opacity: 0.72,
      alphaTest: 0.02,
      depthWrite: false,
    };
  }

  if (isCutout) {
    return {
      transparent: false,
      opacity: 1,
      alphaTest: 0.3,
      depthWrite: true,
    };
  }

  return {
    transparent: false,
    opacity: 1,
    alphaTest: 0,
    depthWrite: true,
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface Viewer3DProps {
  blocks: DecodedBlock[];
  resourcePack?: LoadedResourcePack | null;
}

type ShapeKind =
  | "cube"
  | "stairs_bottom"
  | "stairs_top"
  | "torch"
  | "wire"
  | "chest"
  | "campfire"
  | "cluster"
  | "fence"
  | "wall"
  | "pane"
  | "fence_gate"
  | "sign";

interface RenderSpec {
  shape: ShapeKind;
  yaw: number;
  scaleY: number;
  offsetY: number;
}

function getRenderSpec(block: DecodedBlock): RenderSpec {
  const name = block.block.name;
  const properties = block.block.properties;

  const facing = properties?.facing;
  let facingYaw = 0;
  if (facing === "east") facingYaw = -Math.PI / 2;
  if (facing === "south") facingYaw = Math.PI;
  if (facing === "west") facingYaw = Math.PI / 2;

  // Torches
  if (
    name === "minecraft:torch" ||
    name === "minecraft:redstone_torch" ||
    name === "minecraft:soul_torch"
  ) {
    return { shape: "torch", yaw: 0, scaleY: 1, offsetY: 0 };
  }

  // Redstone wire
  if (
    name === "minecraft:redstone_wire" ||
    name === "minecraft:redstone" ||
    (name.startsWith("minecraft:") && name.includes("redstone") && name.includes("wire"))
  ) {
    return { shape: "wire", yaw: 0, scaleY: 1, offsetY: 0 };
  }

  // Chests
  if (
    name === "minecraft:chest" ||
    name === "minecraft:trapped_chest" ||
    name === "minecraft:dispenser" ||
    name === "minecraft:dropper" ||
    name === "minecraft:observer"
  ) {
    return { shape: "chest", yaw: 0, scaleY: 1, offsetY: 0 };
  }

  // Campfires
  if (
    name === "minecraft:campfire" ||
    name === "minecraft:soul_campfire"
  ) {
    return { shape: "campfire", yaw: 0, scaleY: 1, offsetY: 0 };
  }

  // Amethyst clusters
  if (
    name.includes("amethyst") &&
    (name.includes("cluster") || name.includes("bud"))
  ) {
    return { shape: "cluster", yaw: 0, scaleY: 1, offsetY: 0 };
  }

  // Thin and connected block families
  if (name.endsWith("_fence")) {
    return { shape: "fence", yaw: 0, scaleY: 1, offsetY: 0 };
  }

  if (name.endsWith("_fence_gate")) {
    return { shape: "fence_gate", yaw: facingYaw, scaleY: 1, offsetY: 0 };
  }

  if (name.endsWith("_wall")) {
    return { shape: "wall", yaw: 0, scaleY: 1, offsetY: 0 };
  }

  if (name.endsWith("_pane") || name === "minecraft:iron_bars") {
    return { shape: "pane", yaw: 0, scaleY: 1, offsetY: 0 };
  }

  if (
    name.endsWith("_wall_sign") ||
    name.endsWith("_hanging_sign") ||
    name.endsWith("_sign")
  ) {
    return { shape: "sign", yaw: facingYaw, scaleY: 1, offsetY: 0 };
  }

  // Stairs
  if (name.endsWith("_slab")) {
    const slabType = properties?.type;
    if (slabType === "top") {
      return { shape: "cube", yaw: 0, scaleY: 0.5, offsetY: 0.25 };
    }
    if (slabType === "double") {
      return { shape: "cube", yaw: 0, scaleY: 1, offsetY: 0 };
    }
    return { shape: "cube", yaw: 0, scaleY: 0.5, offsetY: -0.25 };
  }

  if (name.endsWith("_stairs")) {
    const facing = properties?.facing;
    const half = properties?.half;

    let yaw = 0;
    if (facing === "east") yaw = -Math.PI / 2;
    if (facing === "south") yaw = Math.PI;
    if (facing === "west") yaw = Math.PI / 2;

    return {
      shape: half === "top" ? "stairs_top" : "stairs_bottom",
      yaw,
      scaleY: 1,
      offsetY: 0,
    };
  }

  return { shape: "cube", yaw: 0, scaleY: 1, offsetY: 0 };
}

function createStairGeometry(isTop: boolean): THREE.BufferGeometry {
  const base = new THREE.BoxGeometry(1, 0.5, 1);
  base.translate(0, isTop ? 0.25 : -0.25, 0);

  const step = new THREE.BoxGeometry(1, 0.5, 0.5);
  step.translate(0, isTop ? -0.25 : 0.25, 0.25);

  const merged = BufferGeometryUtils.mergeGeometries([base, step], false);
  if (!merged) {
    base.dispose();
    step.dispose();
    return new THREE.BoxGeometry(1, 1, 1);
  }

  base.dispose();
  step.dispose();
  return merged;
}

function createTorchGeometry(): THREE.BufferGeometry {
  const stick = new THREE.BoxGeometry(0.1, 0.8, 0.1);
  stick.translate(0.3, 0, 0.3);

  const flame = new THREE.BoxGeometry(0.3, 0.5, 0.3);
  flame.translate(0.3, 0.5, 0.3);

  const merged = BufferGeometryUtils.mergeGeometries([stick, flame], false);
  if (!merged) {
    stick.dispose();
    flame.dispose();
    return new THREE.BoxGeometry(0.5, 0.8, 0.5);
  }

  stick.dispose();
  flame.dispose();
  return merged;
}

function createRedstoneWireGeometry(): THREE.BufferGeometry {
  const wire = new THREE.BoxGeometry(0.9, 0.1, 0.9);
  wire.translate(0, -0.45, 0);
  return wire;
}

function createChestGeometry(): THREE.BufferGeometry {
  const base = new THREE.BoxGeometry(0.9, 0.7, 0.9);
  base.translate(0, -0.15, 0);

  const lid = new THREE.BoxGeometry(0.9, 0.35, 0.9);
  lid.translate(0, 0.35, 0);

  const merged = BufferGeometryUtils.mergeGeometries([base, lid], false);
  if (!merged) {
    base.dispose();
    lid.dispose();
    return new THREE.BoxGeometry(0.9, 1, 0.9);
  }

  base.dispose();
  lid.dispose();
  return merged;
}

function createCampfireGeometry(): THREE.BufferGeometry {
  const base = new THREE.BoxGeometry(0.9, 0.2, 0.9);
  base.translate(0, -0.4, 0);

  const log1 = new THREE.BoxGeometry(0.2, 0.4, 0.7);
  log1.rotateZ(Math.PI / 4);
  log1.translate(0, -0.1, 0);

  const log2 = new THREE.BoxGeometry(0.2, 0.4, 0.7);
  log2.rotateZ(-Math.PI / 4);
  log2.translate(0, -0.1, 0);

  const merged = BufferGeometryUtils.mergeGeometries([base, log1, log2], false);
  if (!merged) {
    base.dispose();
    log1.dispose();
    log2.dispose();
    return new THREE.BoxGeometry(0.9, 0.6, 0.9);
  }

  base.dispose();
  log1.dispose();
  log2.dispose();
  return merged;
}

function createAmethystClusterGeometry(): THREE.BufferGeometry {
  const main = new THREE.BoxGeometry(0.3, 0.5, 0.3);
  main.translate(0, 0.15, 0);

  const p1 = new THREE.BoxGeometry(0.15, 0.3, 0.15);
  p1.translate(-0.2, 0.3, 0);

  const p2 = new THREE.BoxGeometry(0.15, 0.3, 0.15);
  p2.translate(0.2, 0.3, 0);

  const merged = BufferGeometryUtils.mergeGeometries([main, p1, p2], false);
  if (!merged) {
    main.dispose();
    p1.dispose();
    p2.dispose();
    return new THREE.BoxGeometry(0.5, 0.8, 0.3);
  }

  main.dispose();
  p1.dispose();
  p2.dispose();
  return merged;
}

function createFenceGeometry(): THREE.BufferGeometry {
  const post = new THREE.BoxGeometry(0.2, 1, 0.2);

  const railTop = new THREE.BoxGeometry(0.8, 0.18, 0.18);
  railTop.translate(0, 0.2, 0);

  const railBottom = new THREE.BoxGeometry(0.8, 0.18, 0.18);
  railBottom.translate(0, -0.2, 0);

  const merged = BufferGeometryUtils.mergeGeometries(
    [post, railTop, railBottom],
    false,
  );
  if (!merged) {
    post.dispose();
    railTop.dispose();
    railBottom.dispose();
    return new THREE.BoxGeometry(0.4, 1, 0.4);
  }

  post.dispose();
  railTop.dispose();
  railBottom.dispose();
  return merged;
}

function createWallGeometry(): THREE.BufferGeometry {
  const pillar = new THREE.BoxGeometry(0.5, 1, 0.5);

  const cap = new THREE.BoxGeometry(0.65, 0.14, 0.65);
  cap.translate(0, 0.43, 0);

  const merged = BufferGeometryUtils.mergeGeometries([pillar, cap], false);
  if (!merged) {
    pillar.dispose();
    cap.dispose();
    return new THREE.BoxGeometry(0.6, 1, 0.6);
  }

  pillar.dispose();
  cap.dispose();
  return merged;
}

function createPaneGeometry(): THREE.BufferGeometry {
  return new THREE.BoxGeometry(0.12, 1, 1);
}

function createFenceGateGeometry(): THREE.BufferGeometry {
  const leftPost = new THREE.BoxGeometry(0.16, 1, 0.16);
  leftPost.translate(-0.38, 0, 0);

  const rightPost = new THREE.BoxGeometry(0.16, 1, 0.16);
  rightPost.translate(0.38, 0, 0);

  const top = new THREE.BoxGeometry(0.72, 0.16, 0.16);
  top.translate(0, 0.22, 0);

  const bottom = new THREE.BoxGeometry(0.72, 0.16, 0.16);
  bottom.translate(0, -0.22, 0);

  const merged = BufferGeometryUtils.mergeGeometries(
    [leftPost, rightPost, top, bottom],
    false,
  );
  if (!merged) {
    leftPost.dispose();
    rightPost.dispose();
    top.dispose();
    bottom.dispose();
    return new THREE.BoxGeometry(0.8, 1, 0.22);
  }

  leftPost.dispose();
  rightPost.dispose();
  top.dispose();
  bottom.dispose();
  return merged;
}

function createSignGeometry(): THREE.BufferGeometry {
  const board = new THREE.BoxGeometry(0.92, 0.62, 0.08);
  board.translate(0, 0.12, 0);

  const post = new THREE.BoxGeometry(0.1, 0.52, 0.1);
  post.translate(0, -0.48, 0);

  const merged = BufferGeometryUtils.mergeGeometries([board, post], false);
  if (!merged) {
    board.dispose();
    post.dispose();
    return new THREE.BoxGeometry(0.92, 1, 0.1);
  }

  board.dispose();
  post.dispose();
  return merged;
}

export default function Viewer3D({ blocks, resourcePack }: Viewer3DProps) {
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
      0.05,
      20000,
    );

    // -------- Renderer --------
    const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
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

    // -------- Instanced meshes grouped by material signature --------
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    const textureLoader = new THREE.TextureLoader();

    const geometryCache = new Map<ShapeKind, THREE.BufferGeometry>();
    const textureCache = new Map<string, THREE.Texture>();
    const materialCache = new Map<string, THREE.Material | THREE.Material[]>();
    const groupedIndices = new Map<string, number[]>();
    const sceneMeshes: THREE.InstancedMesh[] = [];

    const getGeometry = (shape: ShapeKind): THREE.BufferGeometry => {
      const existing = geometryCache.get(shape);
      if (existing) return existing;

      let geometry: THREE.BufferGeometry;

      if (shape === "stairs_bottom") {
        geometry = createStairGeometry(false);
      } else if (shape === "stairs_top") {
        geometry = createStairGeometry(true);
      } else if (shape === "torch") {
        geometry = createTorchGeometry();
      } else if (shape === "wire") {
        geometry = createRedstoneWireGeometry();
      } else if (shape === "chest") {
        geometry = createChestGeometry();
      } else if (shape === "campfire") {
        geometry = createCampfireGeometry();
      } else if (shape === "cluster") {
        geometry = createAmethystClusterGeometry();
      } else if (shape === "fence") {
        geometry = createFenceGeometry();
      } else if (shape === "wall") {
        geometry = createWallGeometry();
      } else if (shape === "pane") {
        geometry = createPaneGeometry();
      } else if (shape === "fence_gate") {
        geometry = createFenceGateGeometry();
      } else if (shape === "sign") {
        geometry = createSignGeometry();
      } else {
        geometry = new THREE.BoxGeometry(1, 1, 1);
      }

      geometryCache.set(shape, geometry);
      return geometry;
    };

    const getTexture = (url: string): THREE.Texture => {
      const cached = textureCache.get(url);
      if (cached) return cached;

      try {
        const texture = textureLoader.load(url);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestMipmapNearestFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        textureCache.set(url, texture);
        return texture;
      } catch {
        // Fallback to procedural texture if URL loading fails
        return generateProceduralTexture(url);
      }
    };

    const generateProceduralTexture = (blockName: string): THREE.Texture => {
      const cached = textureCache.get(`proc_${blockName}`);
      if (cached) return cached;

      const blockColor = getBlockColor(blockName, color).getHex();
      const texture = generateBlockTexture(blockName.replace("minecraft:", ""), blockColor, 64);
      textureCache.set(`proc_${blockName}`, texture);
      return texture;
    };

    const getPrimaryTextureUrl = (block: DecodedBlock): string | undefined => {
      if (!resourcePack) return undefined;
      const faceTextures = resolveBlockFaceTextureUrls(block.block, resourcePack);
      if (!faceTextures) return undefined;

      return (
        faceTextures.top ??
        faceTextures.front ??
        faceTextures.right ??
        faceTextures.left ??
        faceTextures.back ??
        faceTextures.bottom
      );
    };

    const buildMaterialsForBlock = (
      block: DecodedBlock,
      shape: ShapeKind,
    ): THREE.Material | THREE.Material[] => {
      const fallbackColor = getBlockColor(block.block.name, color).getHex();
      const flags = getMaterialFlags(block.block.name);
      const fallback = new THREE.MeshLambertMaterial({
        color: fallbackColor,
        transparent: flags.transparent,
        opacity: flags.opacity,
        alphaTest: flags.alphaTest,
        depthWrite: flags.depthWrite,
        side: THREE.DoubleSide,
      });

      // Special shapes: prefer texture (resource pack or procedural fallback)
      if (
        shape === "torch" ||
        shape === "wire" ||
        shape === "chest" ||
        shape === "campfire" ||
        shape === "cluster" ||
        shape === "fence" ||
        shape === "wall" ||
        shape === "pane" ||
        shape === "fence_gate" ||
        shape === "sign"
      ) {
        const textureUrl = getPrimaryTextureUrl(block);
        const texture = textureUrl
          ? getTexture(textureUrl)
          : generateProceduralTexture(block.block.name);

        return new THREE.MeshLambertMaterial({
          map: texture,
          color: fallbackColor,
          transparent: flags.transparent,
          opacity: flags.opacity,
          alphaTest: flags.alphaTest,
          depthWrite: flags.depthWrite,
          side: THREE.DoubleSide,
        });
      }

      if (shape === "stairs_bottom" || shape === "stairs_top") {
        const textureUrl = getPrimaryTextureUrl(block);
        const texture = textureUrl ? getTexture(textureUrl) : generateProceduralTexture(block.block.name);

        return new THREE.MeshLambertMaterial({
          map: texture,
          transparent: flags.transparent,
          opacity: flags.opacity,
          alphaTest: flags.alphaTest,
          depthWrite: flags.depthWrite,
          side: THREE.DoubleSide,
        });
      }

      if (!resourcePack) {
        // Use procedural textures instead of solid colors
        const procTexture = generateProceduralTexture(block.block.name);
        const matWithTexture = new THREE.MeshLambertMaterial({
          map: procTexture,
          transparent: flags.transparent,
          opacity: flags.opacity,
          alphaTest: flags.alphaTest,
          depthWrite: flags.depthWrite,
          side: THREE.DoubleSide,
        });
        return [matWithTexture, matWithTexture, matWithTexture, matWithTexture, matWithTexture, matWithTexture];
      }

      const faceTextures = resolveBlockFaceTextureUrls(block.block, resourcePack);
      if (!faceTextures) {
        // Use procedural textures as fallback
        const procTexture = generateProceduralTexture(block.block.name);
        const matWithTexture = new THREE.MeshLambertMaterial({
          map: procTexture,
          transparent: flags.transparent,
          opacity: flags.opacity,
          alphaTest: flags.alphaTest,
          depthWrite: flags.depthWrite,
          side: THREE.DoubleSide,
        });
        return [matWithTexture, matWithTexture, matWithTexture, matWithTexture, matWithTexture, matWithTexture];
      }

      const faceUrls = [
        faceTextures.right,
        faceTextures.left,
        faceTextures.top,
        faceTextures.bottom,
        faceTextures.front,
        faceTextures.back,
      ];

      return faceUrls.map((url) => {
        if (!url) return fallback;
        return new THREE.MeshLambertMaterial({
          map: getTexture(url),
          transparent: flags.transparent,
          opacity: flags.opacity,
          alphaTest: flags.alphaTest,
          depthWrite: flags.depthWrite,
          side: THREE.DoubleSide,
        });
      });
    };

    const buildKeyForBlock = (block: DecodedBlock, shape: ShapeKind): string => {
      const fallbackHex = getBlockColor(block.block.name, color)
        .getHexString()
        .padStart(6, "0");

      // Special shapes use one texture map (resource pack or procedural fallback)
      if (
        shape === "torch" ||
        shape === "wire" ||
        shape === "chest" ||
        shape === "campfire" ||
        shape === "cluster" ||
        shape === "fence" ||
        shape === "wall" ||
        shape === "pane" ||
        shape === "fence_gate" ||
        shape === "sign"
      ) {
        const specialTexture = getPrimaryTextureUrl(block);
        if (!specialTexture) return `${shape}|color:${fallbackHex}`;
        return `${shape}|tex:${specialTexture}`;
      }

      if (shape === "stairs_bottom" || shape === "stairs_top") {
        const stairTexture = getPrimaryTextureUrl(block);
        if (!stairTexture) return `${shape}|color:${fallbackHex}`;
        return `${shape}|tex:${stairTexture}`;
      }

      if (!resourcePack) return `${shape}|color:${fallbackHex}`;

      const faceTextures = resolveBlockFaceTextureUrls(block.block, resourcePack);
      if (!faceTextures) return `${shape}|color:${fallbackHex}`;

      const keyFaces = [
        faceTextures.right,
        faceTextures.left,
        faceTextures.top,
        faceTextures.bottom,
        faceTextures.front,
        faceTextures.back,
      ].map((value) => value ?? `color:${fallbackHex}`);

      return `${shape}|tex:${keyFaces.join("|")}`;
    };

    const renderSpecs = blocks.map(getRenderSpec);

    for (let i = 0; i < blocks.length; i++) {
      const key = buildKeyForBlock(blocks[i], renderSpecs[i].shape);
      if (!groupedIndices.has(key)) groupedIndices.set(key, []);
      groupedIndices.get(key)?.push(i);
    }

    for (const [key, indices] of groupedIndices.entries()) {
      let materials = materialCache.get(key);
      if (!materials) {
        materials = buildMaterialsForBlock(
          blocks[indices[0]],
          renderSpecs[indices[0]].shape,
        );
        materialCache.set(key, materials);
      }

      const geometry = getGeometry(renderSpecs[indices[0]].shape);
      const mesh = new THREE.InstancedMesh(geometry, materials, indices.length);
      // Prevent aggressive frustum culling from hiding distant instances in large schematics.
      mesh.frustumCulled = false;
      for (let i = 0; i < indices.length; i++) {
        const blockIndex = indices[i];
        const block = blocks[blockIndex];
        const spec = renderSpecs[blockIndex];

        dummy.position.set(
          block.x - cx,
          block.y - cy + spec.offsetY,
          block.z - cz,
        );
        dummy.rotation.set(0, spec.yaw, 0);
        dummy.scale.set(1, spec.scaleY, 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }

      mesh.instanceMatrix.needsUpdate = true;
      scene.add(mesh);
      sceneMeshes.push(mesh);
    }

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
      for (const geometry of geometryCache.values()) {
        geometry.dispose();
      }
      for (const mesh of sceneMeshes) {
        mesh.dispose();
      }
      const disposed = new Set<THREE.Material>();
      for (const materialOrMaterials of materialCache.values()) {
        const list = Array.isArray(materialOrMaterials)
          ? materialOrMaterials
          : [materialOrMaterials];
        for (const mat of list) {
          if (disposed.has(mat)) continue;
          disposed.add(mat);
          mat.dispose();
        }
      }
      for (const texture of textureCache.values()) {
        texture.dispose();
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [blocks, resourcePack]);

  return <div ref={containerRef} className="viewer-3d" />;
}
