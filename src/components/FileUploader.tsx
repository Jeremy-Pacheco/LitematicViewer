import { useCallback, useState } from "react";

interface FileUploaderProps {
  onFileLoaded: (buffer: ArrayBuffer, fileName: string) => void;
  disabled?: boolean;
}

export default function FileUploader({
  onFileLoaded,
  disabled,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          onFileLoaded(reader.result, file.name);
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [onFileLoaded]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      // Verificar que sea un archivo .litematic
      if (!file.name.endsWith(".litematic")) {
        alert("Please upload a .litematic file");
        return;
      }

      processFile(file);
    },
    [disabled, processFile]
  );

  return (
    <div
      className={`file-uploader ${isDragging ? "file-uploader--dragging" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <label className="upload-label">
        <input
          type="file"
          accept=".litematic"
          onChange={handleChange}
          disabled={disabled}
          className="upload-input"
        />
        <div className="upload-content">
          <div className="upload-icon">📁</div>
          <span className="upload-button">
            {disabled ? "Loading…" : "Upload .litematic file"}
          </span>
          <p className="upload-hint">
            or drag and drop your file here
          </p>
        </div>
      </label>
    </div>
  );
}
