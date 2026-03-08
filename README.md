# Litematic 3D Viewer

Aplicación web para visualizar archivos `.litematic` de Minecraft en 3D con renderizado interactivo en el navegador.

![Preview](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-0.183-000000?logo=three.js&logoColor=white)

## Características

- **Soporte completo de formato Litematic** — Lee y parsea archivos `.litematic` creados con [Litematica mod](https://www.curseforge.com/minecraft/mc-mods/litematica)
- **Renderizado 3D optimizado** — Usa `InstancedMesh` de Three.js para renderizar miles de bloques eficientemente
- **Controles intuitivos** — Rota, zoom y paneo con OrbitControls
- **Paleta de colores** — Más de 100 bloques de Minecraft mapeados con sus colores característicos
- **Rápido y ligero** — Carga y procesa archivos en el navegador sin backend

## Inicio rápido

### Instalación

```bash
# Clona el repositorio
git clone <repository-url>
cd Litematic

# Instala dependencias
pnpm install
```

### Desarrollo

```bash
# Inicia el servidor de desarrollo
pnpm dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

### Producción

```bash
# Compila para producción
pnpm build

# Previsualiza la build
pnpm preview
```

## Uso

1. Haz clic en **"Upload .litematic file"**
2. Selecciona un archivo `.litematic` desde tu computadora
3. La aplicación parseará y renderizará la estructura en 3D
4. Usa el mouse para interactuar:
   - **Click izquierdo + arrastrar**: Rotar cámara
   - **Scroll**: Zoom in/out
   - **Click derecho + arrastrar**: Paneo

## Arquitectura

```
src/
├── lib/
│   ├── litematicParser.ts    # Descomprime gzip y parsea NBT
│   └── blockDecoder.ts        # Decodifica bloques del bit-packing
├── components/
│   ├── FileUploader.tsx       # Input de archivo → ArrayBuffer
│   └── Viewer3D.tsx           # Renderizado con Three.js
└── App.tsx                    # Orquestación de componentes
```

### Flujo de datos

```
.litematic file
    ↓
[gzip decompress] → pako
    ↓
[NBT parse] → prismarine-nbt
    ↓
[bit-packed decode] → blockDecoder.ts
    ↓
[3D render] → Three.js InstancedMesh
```

## Stack tecnológico

- **Framework**: [React 19](https://react.dev/) + [TypeScript 5.9](https://www.typescriptlang.org/)
- **Build tool**: [Vite 7](https://vite.dev/)
- **3D engine**: [Three.js 0.183](https://threejs.org/)
- **Descompresión**: [pako](https://github.com/nodeca/pako) (gzip)
- **Parser NBT**: [prismarine-nbt](https://github.com/PrismarineJS/prismarine-nbt)
- **Gestor de paquetes**: [pnpm](https://pnpm.io/)

## Formato .litematic

Los archivos `.litematic` almacenan estructuras de Minecraft con el siguiente formato:

1. **Compresión gzip** — Todo el archivo está comprimido
2. **Formato NBT** — Named Binary Tag, formato de datos de Minecraft  
3. **Regions** — Cada región contiene:
   - `Size`: Dimensiones (x, y, z)
   - `Position`: Posición en el mundo
   - `BlockStatePalette`: Lista de tipos de bloques usados
   - `BlockStates`: Índices empaquetados en bits (pre-1.16 packing)

### Decodificación de bloques

Los índices de bloques se almacenan en un array de `long` (64 bits) usando **bit-packing**:

- Bits por entrada = `max(2, ceil(log2(palette_size)))`
- Los índices pueden cruzar límites de long
- Se usa aritmética BigInt para extracción precisa

## Características técnicas destacadas

### InstancedMesh optimization

En lugar de crear un `Mesh` por cada bloque, usamos un solo `InstancedMesh`:

```typescript
const mesh = new THREE.InstancedMesh(geometry, material, blockCount);
mesh.setMatrixAt(i, matrix);  // Posición única por instancia
mesh.setColorAt(i, color);    // Color único por instancia
```

Esto reduce drásticamente los draw calls y mejora el rendimiento.

### Buffer polyfill

`prismarine-nbt` requiere Node.js `Buffer`. Se inyecta un polyfill para el navegador:

```typescript
import { Buffer } from 'buffer';
globalThis.Buffer = Buffer;
```

## Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo licencia MIT.

## Agradecimientos

- [Litematica mod](https://www.curseforge.com/minecraft/mc-mods/litematica) por el formato de archivo
- [Three.js](https://threejs.org/) por el motor 3D
- [PrismarineJS](https://github.com/PrismarineJS) por prismarine-nbt
