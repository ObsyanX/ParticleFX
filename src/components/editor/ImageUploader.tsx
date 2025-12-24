import { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  uploading: boolean;
  className?: string;
}

export function ImageUploader({ onUpload, uploading, className }: ImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      await onUpload(files);
    }
  }, [onUpload]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      await onUpload(files);
    }
    
    // Reset input
    e.target.value = '';
  }, [onUpload]);

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-lg transition-all duration-200",
        isDragOver 
          ? "border-primary bg-primary/10" 
          : "border-border/50 hover:border-primary/50",
        uploading && "pointer-events-none opacity-50",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={uploading}
      />
      
      <div className="flex flex-col items-center justify-center p-6 text-center">
        {uploading ? (
          <>
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </>
        ) : (
          <>
            <div className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center mb-2 transition-colors",
              isDragOver ? "bg-primary/20" : "bg-muted/50"
            )}>
              <Upload className={cn(
                "h-5 w-5 transition-colors",
                isDragOver ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <p className="text-sm text-muted-foreground">
              {isDragOver ? "Drop images here" : "Drop images or click to upload"}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              PNG, JPG, WebP up to 50MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}

interface AssetThumbnailProps {
  url: string;
  name: string;
  selected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
}

export function AssetThumbnail({ url, name, selected, onSelect, onDelete }: AssetThumbnailProps) {
  return (
    <div
      className={cn(
        "group relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all",
        selected 
          ? "border-primary ring-2 ring-primary/30" 
          : "border-transparent hover:border-primary/50"
      )}
      onClick={onSelect}
    >
      <img
        src={url}
        alt={name}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      
      {/* Overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity",
        selected && "opacity-100"
      )}>
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-xs text-white truncate">{name}</p>
        </div>
      </div>
      
      {/* Delete button */}
      {onDelete && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
      
      {/* Selected indicator */}
      {selected && (
        <div className="absolute top-1 left-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
          <ImageIcon className="h-3 w-3 text-primary-foreground" />
        </div>
      )}
    </div>
  );
}
