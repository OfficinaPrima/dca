import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { parseSchwabCsv, type Holding } from "@/lib/schwab";
import { cn } from "@/lib/utils";

interface CsvUploadProps {
  onLoaded: (holdings: Holding[], fileName: string) => void;
}

export function CsvUpload({ onLoaded }: CsvUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      const result = parseSchwabCsv(text);
      if (result.error) setError(result.error);
      else onLoaded(result.holdings, file.name);
    };
    reader.onerror = () => setError("Couldn't read that file. Try again.");
    reader.readAsText(file);
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className={cn(
          "cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors",
          dragging
            ? "border-primary bg-primary/5"
            : "border-slate-300 bg-white hover:border-slate-400",
        )}
      >
        <Upload className="w-8 h-8 mx-auto text-slate-400 mb-3" />
        <p className="font-semibold text-slate-700">
          Drop your Schwab CSV here, or click to choose
        </p>
        <p className="text-sm text-slate-400 mt-1">
          Read in your browser — never uploaded anywhere.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>
      {error && (
        <p className="mt-3 text-sm text-destructive text-center">{error}</p>
      )}
    </div>
  );
}
