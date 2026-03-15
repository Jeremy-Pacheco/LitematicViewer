import { useCallback } from "react";

interface ResourcePackUploaderProps {
  onPackLoaded: (buffer: ArrayBuffer, fileName: string) => void;
  disabled?: boolean;
}

export default function ResourcePackUploader({
  onPackLoaded,
  disabled,
}: ResourcePackUploaderProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.name.toLowerCase().endsWith(".zip")) {
        alert("Please upload a .zip resource pack.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          onPackLoaded(reader.result, file.name);
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [onPackLoaded],
  );

  return (
    <div className="pack-uploader">
      <label className="pack-upload-label">
        <input
          type="file"
          accept=".zip,application/zip"
          disabled={disabled}
          onChange={handleChange}
          className="upload-input"
        />
        <span className="pack-upload-button">
          {disabled ? "Loading pack..." : "Load Resource Pack (.zip)"}
        </span>
      </label>
    </div>
  );
}
