import { useMemo, useState } from 'react';
import type { DecodedBlock } from '../lib/blockDecoder';
import type { LoadedResourcePack } from '../lib/resourcePack';
import { resolveBlockFaceTextureUrls } from '../lib/resourcePack';
import './MaterialsList.css';

interface MaterialsListProps {
  blocks: DecodedBlock[];
  resourcePack: LoadedResourcePack | null;
}

export default function MaterialsList({ blocks, resourcePack }: MaterialsListProps) {
  const [expanded, setExpanded] = useState(true);

  const materials = useMemo(() => {
    const materialMap = new Map<string, { count: number; block: DecodedBlock }>();

    for (const block of blocks) {
      const key = block.block.name;
      if (materialMap.has(key)) {
        const entry = materialMap.get(key)!;
        entry.count++;
      } else {
        materialMap.set(key, { count: 1, block });
      }
    }

    return Array.from(materialMap.entries())
      .map(([name, { count, block }]) => {
        let texture: string | null = null;
        if (resourcePack) {
          const urls = resolveBlockFaceTextureUrls(block.block, resourcePack);
          texture = urls?.top || urls?.front || urls?.right || null;
        }
        return { name, count, texture };
      })
      .sort((a, b) => b.count - a.count);
  }, [blocks, resourcePack]);

  return (
    <aside className={`materials-drawer ${expanded ? 'materials-drawer--open' : 'materials-drawer--closed'}`}>
      <button
        type="button"
        className="materials-toggle"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        {expanded ? '→' : '←'} Materiales ({materials.length})
      </button>

      <div className="materials-container">
        <div className="materials-header">
          <h3>📦 Materiales ({materials.length})</h3>
          <p className="materials-total">{blocks.length} bloques totales</p>
        </div>

        <div className="materials-list">
          {materials.map((material) => (
            <div key={material.name} className="material-item">
              {material.texture && (
                <img
                  src={material.texture}
                  alt={material.name}
                  className="material-texture"
                  title={material.name}
                />
              )}
              <div className="material-info">
                <span className="material-name">
                  {material.name.replace('minecraft:', '')}
                </span>
                <span className="material-count">× {material.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
