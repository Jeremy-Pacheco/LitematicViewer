import { useState, useCallback } from 'react';
import FileUploader from './components/FileUploader';
import Viewer3D from './components/Viewer3D';
import { parseLitematic } from './lib/litematicParser';
import { decodeBlocks } from './lib/blockDecoder';
import type { DecodedBlock } from './lib/blockDecoder';
import './App.css';

export default function App() {
  const [blocks, setBlocks] = useState<DecodedBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleFileLoaded = useCallback(
    async (buffer: ArrayBuffer, fileName: string) => {
      setLoading(true);
      setError(null);
      setInfo(null);
      setBlocks([]);

      try {
        const data = await parseLitematic(buffer);
        const allBlocks: DecodedBlock[] = [];
        const regionInfos: string[] = [];

        for (const region of data.regions) {
          const decoded = decodeBlocks(region);
          allBlocks.push(...decoded);
          regionInfos.push(
            `${region.name}: ${region.size.x}×${region.size.y}×${region.size.z} (${decoded.length} blocks)`
          );
        }

        setBlocks(allBlocks);
        setInfo(
          `${fileName} — ${data.regions.length} region(s), ${allBlocks.length} total blocks\n${regionInfos.join('\n')}`
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse file');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return (
    <div className="app">
      {blocks.length > 0 && <Viewer3D blocks={blocks} />}

      <div
        className={`overlay ${blocks.length > 0 ? 'overlay--compact' : 'overlay--center'}`}
      >
        <h1 className="title">Litematic Viewer</h1>
        <FileUploader onFileLoaded={handleFileLoaded} disabled={loading} />
        {loading && <p className="status">Parsing file…</p>}
        {error && <p className="status status--error">Error: {error}</p>}
        {info && <pre className="info">{info}</pre>}
      </div>
    </div>
  );
}
