import { useCallback } from "react";

interface FileUploaderProps {
  onFileLoaded: (buffer: ArrayBuffer, fileName: string) => void;
  disabled?: boolean;
}

export default function FileUploader({
  onFileLoaded,
  disabled,
}: FileUploaderProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          onFileLoaded(reader.result, file.name);
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [onFileLoaded],
  );

  return (
    <div className="file-uploader">
      <label className="upload-label">
        <input
          type="file"
          accept=".litematic"
          onChange={handleChange}
          disabled={disabled}
          className="upload-input"
        />
        <span className="upload-button">
          {disabled ? "Loading…" : "Upload .litematic file"}
        </span>
      </label>
    </div>
  );
}
