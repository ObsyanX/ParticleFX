import { useState } from 'react';
import { ScrollReveal } from '@/hooks/useScrollReveal';
import { Play, Pause, Heart, Eye, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GalleryItem {
  id: string;
  title: string;
  author: string;
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
    thumbnail: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&q=80',
    views: 12400,
    likes: 890,
    category: 'Space',
  },
  {
    id: '2',
    title: 'Ocean Wave Morph',
    author: 'Marcus Johnson',
    thumbnail: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&q=80',
    views: 8900,
    likes: 654,
    category: 'Nature',
  },
  {
    id: '3',
    title: 'City Lights Explosion',
    author: 'Emma Rodriguez',
    thumbnail: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&q=80',
    views: 15200,
    likes: 1120,
    category: 'Urban',
  },
  {
    id: '4',
    title: 'Abstract Flow',
    author: 'David Kim',
    thumbnail: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600&q=80',
    views: 7600,
    likes: 520,
    category: 'Abstract',
  },
  {
    id: '5',
    title: 'Northern Lights Dance',
    author: 'Anna Svensson',
    thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80',
    views: 21000,
    likes: 1890,
    category: 'Nature',
  },
  {
    id: '6',
    title: 'Geometric Swirl',
    author: 'Alex Turner',
    thumbnail: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=600&q=80',
    views: 9400,
    likes: 678,
    category: 'Abstract',
  },
];

const categories = ['All', 'Space', 'Nature', 'Urban', 'Abstract'];

export function GallerySection() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const filteredItems = activeCategory === 'All' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <section id="gallery" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
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
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border/50'
              }`}
            >
              {category}
            </button>
          ))}
        </ScrollReveal>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <ScrollReveal key={item.id} delay={index * 0.1}>
              <div
                className="group relative rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Thumbnail */}
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent transition-opacity duration-300 ${
                    hoveredItem === item.id ? 'opacity-100' : 'opacity-0'
                  }`} />
                  
                  {/* Play Button */}
                  <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                    hoveredItem === item.id ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                  }`}>
                    <button className="h-16 w-16 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary transition-colors">
                      <Play className="h-7 w-7 ml-1" fill="currentColor" />
                    </button>
                  </div>

                  {/* Category Badge */}
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
                  <p className="text-sm text-muted-foreground mb-3">
                    by {item.author}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Eye className="h-4 w-4" />
                        {formatNumber(item.views)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Heart className="h-4 w-4" />
                        {formatNumber(item.likes)}
                      </span>
                    </div>
                    
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-muted/50">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Animated border on hover */}
                <div className={`absolute inset-0 rounded-2xl transition-opacity duration-500 pointer-events-none ${
                  hoveredItem === item.id ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="absolute inset-0 rounded-2xl border-2 border-primary/50" />
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* CTA */}
        <ScrollReveal delay={0.3} className="text-center mt-12">
          <Button 
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
          >
            View All Creations
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Over 10,000+ animations created by our community
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
