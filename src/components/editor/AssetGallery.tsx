import { Asset } from '@/hooks/useProjectAssets';
import { ImageUploader, AssetThumbnail } from './ImageUploader';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderOpen, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface AssetGalleryProps {
  assets: Asset[];
  loading: boolean;
  uploading: boolean;
  selectedAssets: string[];
  onUpload: (files: File[]) => Promise<void>;
  onSelect: (assetId: string) => void;
  onDelete: (assetId: string) => void;
  onReorder?: (assets: Asset[]) => void;
}

interface SortableAssetProps {
  asset: Asset;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function SortableAsset({ asset, selected, onSelect, onDelete }: SortableAssetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: asset.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 z-10 h-6 w-6 rounded bg-background/80 flex items-center justify-center cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </div>
      <AssetThumbnail
        url={asset.file_url}
        name={asset.file_name || 'Image'}
        selected={selected}
        onSelect={onSelect}
        onDelete={onDelete}
      />
    </div>
  );
}

export function AssetGallery({
  assets,
  loading,
  uploading,
  selectedAssets,
  onUpload,
  onSelect,
  onDelete,
  onReorder,
}: AssetGalleryProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = assets.findIndex((a) => a.id === active.id);
      const newIndex = assets.findIndex((a) => a.id === over.id);
      const newOrder = arrayMove(assets, oldIndex, newIndex);
      onReorder?.(newOrder);
    }
  };

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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={assets.map(a => a.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 gap-2">
                {assets.map((asset) => (
                  <SortableAsset
                    key={asset.id}
                    asset={asset}
                    selected={selectedAssets.includes(asset.id)}
                    onSelect={() => onSelect(asset.id)}
                    onDelete={() => onDelete(asset.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </ScrollArea>
      )}

      {/* Selection info */}
      {selectedAssets.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            {selectedAssets.length} image{selectedAssets.length > 1 ? 's' : ''} selected
          </p>
          <p className="text-[10px] text-muted-foreground/70 mt-1">
            Drag to reorder images
          </p>
        </div>
      )}
    </div>
  );
}
