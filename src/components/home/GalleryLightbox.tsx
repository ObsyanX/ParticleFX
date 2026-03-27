import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Heart, Eye, X, User } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface GalleryItem {
  id: string;
  title: string;
  author: string;
  description: string;
  thumbnail: string;
  views: number;
  likes: number;
  category: string;
}

interface GalleryLightboxProps {
  item: GalleryItem | null;
  open: boolean;
  onClose: () => void;
  formatNumber: (n: number) => string;
}

export function GalleryLightbox({ item, open, onClose, formatNumber }: GalleryLightboxProps) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-card border-border/50 gap-0">
        <VisuallyHidden>
          <DialogTitle>{item.title}</DialogTitle>
        </VisuallyHidden>

        {/* Image */}
        <div className="relative aspect-video w-full overflow-hidden">
          <img
            src={item.thumbnail.replace('w=600', 'w=1200')}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-background/80 backdrop-blur-sm text-foreground border border-border/50">
              {item.category}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
            <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>{item.author}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {item.description}
          </p>

          <div className="flex items-center gap-5 pt-2 border-t border-border/50 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              {formatNumber(item.views)} views
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="h-4 w-4" />
              {formatNumber(item.likes)} likes
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
