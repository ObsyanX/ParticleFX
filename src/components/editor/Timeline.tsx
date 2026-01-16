import { useState, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Asset } from '@/hooks/useProjectAssets';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  TouchSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TimelineProps {
  assets: Asset[];
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  onTimeChange: (time: number) => void;
  onPlayPause: () => void;
  onAssetSelect: (assetId: string) => void;
  selectedAssetId: string | null;
  onReorderAssets?: (assets: Asset[]) => void;
}

interface SortableAssetProps {
  asset: Asset;
  index: number;
  isSelected: boolean;
  startTime: number;
  onSelect: () => void;
  formatTime: (seconds: number) => string;
  isOver?: boolean;
  overPosition?: 'before' | 'after' | null;
}

function SortableAsset({ asset, index, isSelected, startTime, onSelect, formatTime, isOver, overPosition }: SortableAssetProps) {
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
  };

  return (
    <div className="relative flex items-center h-full">
      {/* Drop indicator - before */}
      {isOver && overPosition === 'before' && (
        <div className="absolute -left-1 top-1 bottom-1 w-1 bg-primary rounded-full z-20 animate-pulse shadow-lg shadow-primary/50" />
      )}
      
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "relative h-full overflow-hidden cursor-pointer border-2 transition-all rounded-md flex-shrink-0",
          "w-20 sm:w-24 md:w-28",
          isDragging && "opacity-30 scale-95",
          isSelected 
            ? "border-primary ring-1 ring-primary/30" 
            : "border-transparent hover:border-primary/50"
        )}
        onClick={onSelect}
      >
        {/* Drag handle */}
        <div 
          {...attributes} 
          {...listeners}
          className="absolute top-1 right-1 z-10 p-1 bg-black/50 rounded cursor-grab active:cursor-grabbing hover:bg-black/70 transition-colors"
        >
          <GripVertical className="h-3 w-3 text-white" />
        </div>
        
        <img
          src={asset.file_url}
          alt={asset.file_name || 'Asset'}
          className="w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity">
          <div className="absolute bottom-1 left-1 right-1">
            <p className="text-[9px] sm:text-[10px] text-white truncate">
              {asset.file_name || `Image ${index + 1}`}
            </p>
          </div>
        </div>
        
        {/* Time marker */}
        <div className="absolute top-1 left-1 px-1 sm:px-1.5 py-0.5 bg-black/70 rounded text-[8px] sm:text-[9px] text-white font-mono">
          {formatTime(startTime)}
        </div>
      </div>

      {/* Drop indicator - after */}
      {isOver && overPosition === 'after' && (
        <div className="absolute -right-1 top-1 bottom-1 w-1 bg-primary rounded-full z-20 animate-pulse shadow-lg shadow-primary/50" />
      )}
    </div>
  );
}

function DragOverlayItem({ asset }: { asset: Asset }) {
  return (
    <div className="relative h-16 w-20 sm:w-24 md:w-28 overflow-hidden rounded-md border-2 border-primary shadow-2xl shadow-primary/30 bg-card">
      <img
        src={asset.file_url}
        alt={asset.file_name || 'Asset'}
        className="w-full h-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-primary/10" />
    </div>
  );
}

export function Timeline({
  assets,
  duration,
  currentTime,
  isPlaying,
  onTimeChange,
  onPlayPause,
  onAssetSelect,
  selectedAssetId,
  onReorderAssets,
}: TimelineProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const transitionDuration = assets.length > 1 ? duration / (assets.length - 1) : duration;

  const activeAsset = activeId ? assets.find(a => a.id === activeId) : null;

  // Navigate to previous/next asset
  const navigateAsset = useCallback((direction: 'prev' | 'next') => {
    if (assets.length === 0) return;
    
    const currentIndex = selectedAssetId 
      ? assets.findIndex(a => a.id === selectedAssetId)
      : -1;
    
    let newIndex: number;
    if (direction === 'prev') {
      newIndex = currentIndex <= 0 ? assets.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex >= assets.length - 1 ? 0 : currentIndex + 1;
    }
    
    onAssetSelect(assets[newIndex].id);
    onTimeChange(newIndex * transitionDuration);
  }, [assets, selectedAssetId, onAssetSelect, onTimeChange, transitionDuration]);

  // Touch handlers for swipe gestures on the timeline track
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    setIsSwiping(false);
    setSwipeDirection(null);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    
    // Only handle horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
      setIsSwiping(true);
      setSwipeDirection(deltaX > 0 ? 'right' : 'left');
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaTime = Date.now() - touchStartRef.current.time;
    
    // Swipe threshold: 50px distance and less than 300ms
    const isQuickSwipe = Math.abs(deltaX) > 50 && deltaTime < 300;
    
    if (isQuickSwipe && isSwiping) {
      if (deltaX > 0) {
        navigateAsset('prev');
      } else {
        navigateAsset('next');
      }
    }
    
    touchStartRef.current = null;
    setIsSwiping(false);
    setSwipeDirection(null);
  }, [isSwiping, navigateAsset]);

  // Touch scrubbing on the progress bar area
  const handleScrubberTouch = useCallback((e: React.TouchEvent) => {
    if (!scrubberRef.current) return;
    
    const rect = scrubberRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * duration;
    onTimeChange(newTime);
  }, [duration, onTimeChange]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string | null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setOverId(null);

    if (over && active.id !== over.id) {
      const oldIndex = assets.findIndex((a) => a.id === active.id);
      const newIndex = assets.findIndex((a) => a.id === over.id);
      const newOrder = arrayMove(assets, oldIndex, newIndex);
      onReorderAssets?.(newOrder);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
  };

  const getOverPosition = (assetId: string): 'before' | 'after' | null => {
    if (!activeId || !overId || overId !== assetId) return null;
    
    const activeIndex = assets.findIndex(a => a.id === activeId);
    const overIndex = assets.findIndex(a => a.id === overId);
    
    if (activeIndex === -1 || overIndex === -1) return null;
    
    return activeIndex < overIndex ? 'after' : 'before';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Controls row */}
      <div className="flex items-center gap-2 sm:gap-4 mb-3 flex-wrap">
        {/* Playback controls */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 sm:h-8 sm:w-8"
            onClick={() => onTimeChange(0)}
          >
            <SkipBack className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 hover:bg-primary/20"
            onClick={onPlayPause}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            ) : (
              <Play className="h-4 w-4 sm:h-5 sm:w-5 text-primary ml-0.5" />
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 sm:h-8 sm:w-8"
            onClick={() => onTimeChange(duration)}
          >
            <SkipForward className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>

        {/* Mobile navigation buttons */}
        <div className="flex items-center gap-1 sm:hidden">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-7 w-7"
            onClick={() => navigateAsset('prev')}
            disabled={assets.length === 0}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-7 w-7"
            onClick={() => navigateAsset('next')}
            disabled={assets.length === 0}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Time display */}
        <div className="text-xs sm:text-sm font-mono text-muted-foreground whitespace-nowrap">
          <span className="text-foreground">{formatTime(currentTime)}</span>
          <span className="mx-1">/</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Scrubber with touch support */}
        <div 
          ref={scrubberRef}
          className="flex-1 min-w-[100px] touch-none"
          onTouchMove={handleScrubberTouch}
          onTouchStart={handleScrubberTouch}
        >
          <Slider
            value={[currentTime]}
            onValueChange={([value]) => onTimeChange(value)}
            min={0}
            max={duration}
            step={0.01}
            className="w-full"
          />
        </div>
      </div>

      {/* Asset timeline track - Drag and Drop with swipe support */}
      <div 
        className={cn(
          "flex-1 bg-muted/30 rounded-lg border border-border/50 overflow-hidden relative transition-all",
          isSwiping && swipeDirection === 'left' && "border-l-primary border-l-2",
          isSwiping && swipeDirection === 'right' && "border-r-primary border-r-2"
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Swipe indicator overlays */}
        {isSwiping && (
          <>
            {swipeDirection === 'left' && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-primary/20 rounded-full p-2 animate-pulse">
                <ChevronRight className="h-4 w-4 text-primary" />
              </div>
            )}
            {swipeDirection === 'right' && (
              <div className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-primary/20 rounded-full p-2 animate-pulse">
                <ChevronLeft className="h-4 w-4 text-primary" />
              </div>
            )}
          </>
        )}

        {assets.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs sm:text-sm text-muted-foreground p-2">
            Upload images to create a timeline
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={assets.map(a => a.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="h-full flex items-center gap-1 p-1 overflow-x-auto">
                {assets.map((asset, index) => {
                  const isSelected = asset.id === selectedAssetId;
                  const startTime = index * transitionDuration;
                  const overPosition = getOverPosition(asset.id);
                  
                  return (
                    <SortableAsset
                      key={asset.id}
                      asset={asset}
                      index={index}
                      isSelected={isSelected}
                      startTime={startTime}
                      onSelect={() => onAssetSelect(asset.id)}
                      formatTime={formatTime}
                      isOver={overId === asset.id && activeId !== asset.id}
                      overPosition={overPosition}
                    />
                  );
                })}
              </div>
            </SortableContext>
            
            <DragOverlay dropAnimation={{
              duration: 200,
              easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}>
              {activeAsset ? <DragOverlayItem asset={activeAsset} /> : null}
            </DragOverlay>
          </DndContext>
        )}

        {/* Playhead */}
        {assets.length > 0 && (
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-primary shadow-lg shadow-primary/50 pointer-events-none z-10"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
