import { useState, useEffect, useRef } from 'react';
import { ScrollReveal } from '@/hooks/useScrollReveal';
import { Play, Heart, Eye, ExternalLink, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { GalleryParticles } from './GalleryParticles';
import { GalleryLightbox } from './GalleryLightbox';
import { cn } from '@/lib/utils';

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

const galleryItems: GalleryItem[] = [
  {
    id: '1',
    title: 'Cosmic Nebula Transition',
    author: 'Sarah Chen',
    description: 'Ultra-cinematic 3D cosmic particle simulation. Millions of glowing atomic particles floating in deep space, attracted to invisible energy cores, forming spiral nebula filaments before exploding into drifting atoms.',
    thumbnail: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&q=80',
    views: 12400,
    likes: 890,
    category: 'Space',
  },
  {
    id: '2',
    title: 'Ocean Wave Morph',
    author: 'Marcus Johnson',
    description: 'Serene ocean particles morphing through wave patterns with fluid, calming motion.',
    thumbnail: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&q=80',
    views: 8900,
    likes: 654,
    category: 'Nature',
  },
  {
    id: '3',
    title: 'City Lights Explosion',
    author: 'Emma Rodriguez',
    description: 'Urban nightscape particles bursting with neon energy and metropolitan vibrancy.',
    thumbnail: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&q=80',
    views: 15200,
    likes: 1120,
    category: 'Urban',
  },
  {
    id: '4',
    title: 'Abstract Flow',
    author: 'David Kim',
    description: 'Mesmerizing abstract patterns flowing through chromatic particle streams.',
    thumbnail: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600&q=80',
    views: 7600,
    likes: 520,
    category: 'Abstract',
  },
  {
    id: '5',
    title: 'Northern Lights Dance',
    author: 'Anna Svensson',
    description: 'Aurora borealis particles dancing with ethereal plasma gradients and soft volumetric fog.',
    thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80',
    views: 21000,
    likes: 1890,
    category: 'Nature',
  },
  {
    id: '6',
    title: 'Geometric Swirl',
    author: 'Alex Turner',
    description: 'Precise geometric particles spiraling through mathematical beauty and form.',
    thumbnail: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=600&q=80',
    views: 9400,
    likes: 678,
    category: 'Abstract',
  },
  {
    id: '7',
    title: 'Solar Flare Burst',
    author: 'Liam Park',
    description: 'Explosive solar flare particles erupting with intense plasma energy and coronal mass ejection dynamics.',
    thumbnail: 'https://images.unsplash.com/photo-1534996858221-380b92700493?w=600&q=80',
    views: 18300,
    likes: 1340,
    category: 'Space',
  },
  {
    id: '8',
    title: 'Rain on Glass',
    author: 'Mia Torres',
    description: 'Photorealistic rain droplets sliding down glass with refraction, bokeh blur, and soft ambient glow.',
    thumbnail: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&q=80',
    views: 11200,
    likes: 920,
    category: 'Nature',
  },
  {
    id: '9',
    title: 'Neon Metro Pulse',
    author: 'Jake Wilson',
    description: 'Cyberpunk cityscape particles pulsing with neon trails, light streaks, and electric fog.',
    thumbnail: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&q=80',
    views: 13700,
    likes: 1050,
    category: 'Urban',
  },
  {
    id: '10',
    title: 'Fractal Bloom',
    author: 'Chloe Nakamura',
    description: 'Recursive fractal particles blooming outward in hypnotic, self-similar spiraling patterns.',
    thumbnail: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&q=80',
    views: 6800,
    likes: 480,
    category: 'Abstract',
  },
  {
    id: '11',
    title: 'Galaxy Collision',
    author: 'Omar Hassan',
    description: 'Two spiral galaxies merging in slow gravitational ballet, with tidal streams of stars and interstellar dust.',
    thumbnail: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=600&q=80',
    views: 24500,
    likes: 2100,
    category: 'Space',
  },
  {
    id: '12',
    title: 'Cherry Blossom Drift',
    author: 'Yuki Tanaka',
    description: 'Delicate sakura petals drifting on gentle spring wind with soft depth-of-field and ambient sunlight.',
    thumbnail: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=600&q=80',
    views: 16100,
    likes: 1560,
    category: 'Nature',
  },
];

const ITEMS_PER_PAGE = 6;
const categories = ['All', 'Space', 'Nature', 'Urban', 'Abstract'];

const formatNumber = (num: number): string => {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

function GalleryCard({
  item,
  index,
  isHovered,
  isLiked,
  likeCount,
  onHover,
  onLeave,
  onClick,
  onLike,
}: {
  item: GalleryItem;
  index: number;
  isHovered: boolean;
  isLiked: boolean;
  likeCount: number;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
  onLike: (e: React.MouseEvent) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 60);
    return () => {
      clearTimeout(timer);
      setVisible(false);
    };
  }, [index]);

  return (
    <div
      className={cn(
        'transition-all duration-500 ease-out',
        visible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-6 scale-95'
      )}
    >
      <div
        className="group relative rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 cursor-pointer"
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        onClick={onClick}
      >
        {/* Thumbnail */}
        <div className="aspect-video relative overflow-hidden">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className={cn(
            'absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent transition-opacity duration-300',
            isHovered ? 'opacity-100' : 'opacity-0'
          )} />
          <div className={cn(
            'absolute inset-0 flex items-center justify-center transition-all duration-300',
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          )}>
            <button className="h-16 w-16 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary transition-colors">
              <Play className="h-7 w-7 ml-1" fill="currentColor" />
            </button>
          </div>
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-background/80 backdrop-blur-sm text-foreground border border-border/50">
              {item.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2 cursor-default">
                  {item.description}
                </p>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">
                {item.description}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p className="text-sm text-muted-foreground/70 mb-3">
            by {item.author}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                {formatNumber(item.views)}
              </span>
              <button
                onClick={onLike}
                className={cn(
                  'flex items-center gap-1.5 transition-all duration-300 hover:scale-110',
                  isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'
                )}
              >
                <Heart
                  className={cn('h-4 w-4 transition-transform duration-300', isLiked && 'scale-110')}
                  fill={isLiked ? 'currentColor' : 'none'}
                />
                {formatNumber(likeCount)}
              </button>
            </div>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-muted/50">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Animated border on hover */}
        <div className={cn(
          'absolute inset-0 rounded-2xl transition-opacity duration-500 pointer-events-none',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}>
          <div className="absolute inset-0 rounded-2xl border-2 border-primary/50" />
        </div>
      </div>
    </div>
  );
}

export function GallerySection() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    galleryItems.forEach(item => { counts[item.id] = item.likes; });
    return counts;
  });
  const [filterKey, setFilterKey] = useState(0);

  const filteredItems = activeCategory === 'All'
    ? galleryItems
    : galleryItems.filter(item => item.category === activeCategory);

  const displayedItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setVisibleCount(ITEMS_PER_PAGE);
    setFilterKey(prev => prev + 1);
  };

  const loadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  const handleLike = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    setLikedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
        setLikeCounts(c => ({ ...c, [itemId]: (c[itemId] || 0) - 1 }));
      } else {
        next.add(itemId);
        setLikeCounts(c => ({ ...c, [itemId]: (c[itemId] || 0) + 1 }));
      }
      return next;
    });
  };

  return (
    <section id="gallery" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <GalleryParticles />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Inspiration Gallery
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            Created by Our{' '}
            <span className="text-gradient">Community</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Explore stunning particle animations created by artists and creators using ParticleFX.
            Get inspired and start creating your own.
          </p>
        </ScrollReveal>

        {/* Category Filter */}
        <ScrollReveal delay={0.1} className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                activeCategory === category
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border/50'
              )}
            >
              {category}
            </button>
          ))}
        </ScrollReveal>

        {/* Gallery Grid */}
        <div key={filterKey} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedItems.map((item, index) => (
            <GalleryCard
              key={item.id}
              item={item}
              index={index}
              isHovered={hoveredItem === item.id}
              isLiked={likedItems.has(item.id)}
              likeCount={likeCounts[item.id] || item.likes}
              onHover={() => setHoveredItem(item.id)}
              onLeave={() => setHoveredItem(null)}
              onClick={() => setLightboxItem(item)}
              onLike={(e) => handleLike(e, item.id)}
            />
          ))}
        </div>

        {/* Load More / CTA */}
        <ScrollReveal delay={0.3} className="text-center mt-12">
          {hasMore ? (
            <Button
              size="lg"
              variant="outline"
              onClick={loadMore}
              className="border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary/50"
            >
              Load More
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
            >
              View All Creations
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          )}
          <p className="text-sm text-muted-foreground mt-4">
            Over 10,000+ animations created by our community
          </p>
        </ScrollReveal>
      </div>

      {/* Lightbox */}
      <GalleryLightbox
        item={lightboxItem}
        open={!!lightboxItem}
        onClose={() => setLightboxItem(null)}
        formatNumber={formatNumber}
      />
    </section>
  );
}
