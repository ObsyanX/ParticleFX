import { Asset } from '@/hooks/useProjectAssets';
import { ImageUploader, AssetThumbnail } from './ImageUploader';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderOpen } from 'lucide-react';

interface AssetGalleryProps {
  assets: Asset[];
  loading: boolean;
  uploading: boolean;
  selectedAssets: string[];
  onUpload: (files: File[]) => Promise<void>;
  onSelect: (assetId: string) => void;
  onDelete: (assetId: string) => void;
}

export function AssetGallery({
  assets,
  loading,
  uploading,
  selectedAssets,
  onUpload,
  onSelect,
  onDelete,
}: AssetGalleryProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="aspect-square rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Upload area */}
      <ImageUploader
        onUpload={onUpload}
        uploading={uploading}
        className="mb-4"
      />

      {/* Assets list */}
      {assets.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
            <FolderOpen className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">No images yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Upload images to create particles
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1 -mx-4 px-4">
          <div className="grid grid-cols-2 gap-2">
            {assets.map((asset) => (
              <AssetThumbnail
                key={asset.id}
                url={asset.file_url}
                name={asset.file_name || 'Image'}
                selected={selectedAssets.includes(asset.id)}
                onSelect={() => onSelect(asset.id)}
                onDelete={() => onDelete(asset.id)}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Selection info */}
      {selectedAssets.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            {selectedAssets.length} image{selectedAssets.length > 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  );
}
