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

      {blocks.length === 0 ? (
        <div className="landing-page">
          <div className="hero-section">
            <h1 className="hero-title">Litematic Viewer</h1>
            <p className="hero-subtitle">
              Visualize your Minecraft builds in stunning 3D, right in your browser
            </p>
            <FileUploader onFileLoaded={handleFileLoaded} disabled={loading} />
            {loading && <p className="status">Parsing file…</p>}
            {error && <p className="status status--error">Error: {error}</p>}
          </div>

          <div className="features-section">
            <h2 className="section-title">Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📦</div>
                <h3 className="feature-title">Full Litematic Support</h3>
                <p className="feature-description">
                  Parse and display .litematic files created with the Litematica mod
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🚀</div>
                <h3 className="feature-title">Blazing Fast</h3>
                <p className="feature-description">
                  Optimized rendering with InstancedMesh - handle thousands of blocks smoothly
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎨</div>
                <h3 className="feature-title">100+ Block Types</h3>
                <p className="feature-description">
                  Accurate color palette for Minecraft blocks with realistic textures
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎮</div>
                <h3 className="feature-title">Interactive Controls</h3>
                <p className="feature-description">
                  Rotate, zoom, and pan freely to explore every angle of your build
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3 className="feature-title">Fully Private</h3>
                <p className="feature-description">
                  All processing happens in your browser - no uploads, no tracking
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3 className="feature-title">No Installation</h3>
                <p className="feature-description">
                  Works instantly in any modern browser - no downloads required
                </p>
              </div>
            </div>
          </div>

          <div className="quickstart-section">
            <h2 className="section-title">Quick Start</h2>
            <div className="steps-container">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3 className="step-title">Export from Litematica</h3>
                  <p className="step-description">
                    In Minecraft, use the Litematica mod to save your build as a .litematic file
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3 className="step-title">Upload Your File</h3>
                  <p className="step-description">
                    Click the upload button above and select your .litematic file
                  </p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3 className="step-title">Explore in 3D</h3>
                  <p className="step-description">
                    Use your mouse to rotate, zoom, and explore your build from any angle
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="examples-section">
            <h2 className="section-title">What You Can View</h2>
            <div className="examples-grid">
              <div className="example-card">
                <div className="example-icon">🏰</div>
                <h3 className="example-title">Castles & Fortresses</h3>
                <p className="example-description">Medieval builds, towers, and defensive structures</p>
              </div>
              <div className="example-card">
                <div className="example-icon">🏡</div>
                <h3 className="example-title">Houses & Villas</h3>
                <p className="example-description">Residential buildings from cozy cottages to mansions</p>
              </div>
              <div className="example-card">
                <div className="example-icon">⚙️</div>
                <h3 className="example-title">Redstone Contraptions</h3>
                <p className="example-description">Complex mechanisms and automated farms</p>
              </div>
              <div className="example-card">
                <div className="example-icon">🌆</div>
                <h3 className="example-title">City Structures</h3>
                <p className="example-description">Skyscrapers, shops, and urban architecture</p>
              </div>
            </div>
          </div>

          <div className="tips-section">
            <h2 className="section-title">Tips for Best Experience</h2>
            <ul className="tips-list">
              <li>💡 Use <strong>left mouse button</strong> to rotate the view</li>
              <li>💡 Use <strong>scroll wheel</strong> to zoom in and out</li>
              <li>💡 Use <strong>right mouse button</strong> to pan around</li>
              <li>💡 For large builds (10,000+ blocks), loading may take a few seconds</li>
              <li>💡 Works best with Chrome, Firefox, or Edge browsers</li>
            </ul>
          </div>

          <footer className="landing-footer">
            <p>Built with React, TypeScript, and Three.js • No data collection • Open Source</p>
          </footer>
        </div>
      ) : (
        <div className="overlay overlay--compact">
          <h1 className="title">Litematic Viewer</h1>
          <button className="new-file-button" onClick={() => setBlocks([])}>
            ← Load New File
          </button>
          {info && <pre className="info">{info}</pre>}
        </div>
      )}
    </div>
  );
}
