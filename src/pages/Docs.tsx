import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Helmet } from 'react-helmet-async';
import { 
  Sparkles, 
  ArrowLeft, 
  Search, 
  Book, 
  Code, 
  Zap, 
  Settings,
  Upload,
  Play,
  Download,
  Palette,
  Moon,
  Sun
} from 'lucide-react';

const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Zap,
    content: [
      {
        id: 'introduction',
        title: 'Introduction',
        content: `
# Welcome to ParticleFX

ParticleFX is a powerful web-based platform that transforms static images into stunning 3D particle animations. Using WebGL and real-time rendering, you can create cinematic video content without any 3D experience.

## What You Can Create

- **Image transitions** - Morph between multiple images with particle effects
- **3D animations** - Add depth and motion to static images
- **Video exports** - Download your creations as high-quality videos
- **Reusable code** - Export animation code for your own projects

## Key Features

- Real-time 60fps preview
- 15+ transition styles
- Timeline-based control
- Custom color enhancement
- Background customization
        `,
      },
      {
        id: 'quick-start',
        title: 'Quick Start Guide',
        content: `
# Quick Start Guide

Get your first particle animation up and running in minutes.

## Step 1: Create an Account

1. Click **Sign Up Free** on the homepage
2. Enter your email and password
3. Verify your email (if required)

## Step 2: Create a New Project

1. From your dashboard, click **New Project**
2. Give your project a name
3. You'll be taken to the editor

## Step 3: Upload Images

1. In the left sidebar, click the upload area
2. Select 2 or more images
3. Images will appear in the asset gallery

## Step 4: Preview & Customize

1. Your images automatically start animating
2. Use the right sidebar to adjust settings:
   - Particle count and size
   - Transition style
   - Color enhancement
   - Background options

## Step 5: Export

1. Click **Export Video** to download as MP4
2. Or click **Export Code** for reusable code
        `,
      },
    ],
  },
  {
    id: 'editor',
    title: 'Using the Editor',
    icon: Settings,
    content: [
      {
        id: 'interface',
        title: 'Editor Interface',
        content: `
# Editor Interface

The ParticleFX editor is divided into three main areas:

## Left Sidebar - Assets

- **Image Uploader** - Drag and drop or click to upload
- **Asset Gallery** - View and manage uploaded images
- **Drag to Reorder** - Change animation sequence

## Center - Canvas

- **Live Preview** - Real-time particle animation
- **60fps Rendering** - Smooth WebGL performance
- **Interactive Controls** - Orbit camera with mouse

## Right Sidebar - Settings

- **Presets** - One-click animation styles
- **Particles** - Count, size, depth settings
- **Color Enhancement** - Contrast, saturation, brightness
- **Transition** - Style and duration
- **Timeline** - Duration, FPS, loop settings
- **Background** - Color, gradient, or image

## Bottom - Timeline

- **Playback Controls** - Play, pause, scrub
- **Progress Bar** - See current position
- **Duration Display** - Total animation length
        `,
      },
      {
        id: 'particle-settings',
        title: 'Particle Settings',
        content: `
# Particle Settings

Fine-tune your particle animation with these controls:

## Particle Count

- **Range**: 5,000 - 100,000 particles
- **Higher count** = More detail, more GPU usage
- **Lower count** = Faster performance, less detail
- **Recommended**: 50,000 for most use cases

## Particle Size

- **Range**: 0.5 - 5.0
- **Smaller** = More detailed, subtle effect
- **Larger** = Bolder, more visible particles

## Depth Effect

- Adds Z-axis variation to particles
- Creates a more 3D, layered appearance
- Works best with auto-rotate enabled
        `,
      },
      {
        id: 'transitions',
        title: 'Transition Styles',
        content: `
# Transition Styles

Choose from 15 unique transition effects:

## Basic Transitions

- **Morph** - Smooth blend between images
- **Explode** - Particles scatter and reform
- **Swirl** - Spiral motion transition
- **Wave** - Ripple effect across particles
- **Depth Push** - Z-axis zoom effect

## Advanced Transitions

- **Dissolve** - Fade particles in/out
- **Spiral** - Circular motion path
- **Gravity** - Fall and rise effect
- **Vortex** - Tunnel/wormhole effect
- **Pixelate** - Grid shuffle transition

## Creative Transitions

- **Shatter** - Glass break effect
- **Magnetic** - Attract and repel
- **Ripple** - Water drop effect
- **Scatter** - Random spread
- **Tornado** - Funnel spin
        `,
      },
    ],
  },
  {
    id: 'api',
    title: 'API Reference',
    icon: Code,
    content: [
      {
        id: 'overview',
        title: 'API Overview',
        content: `
# API Reference

> **Coming Soon**: Full API access is coming to Studio plan subscribers.

## Planned Endpoints

### Projects

\`\`\`
GET    /api/v1/projects         # List all projects
POST   /api/v1/projects         # Create new project
GET    /api/v1/projects/:id     # Get project details
PUT    /api/v1/projects/:id     # Update project
DELETE /api/v1/projects/:id     # Delete project
\`\`\`

### Assets

\`\`\`
GET    /api/v1/projects/:id/assets    # List assets
POST   /api/v1/projects/:id/assets    # Upload asset
DELETE /api/v1/assets/:id             # Delete asset
\`\`\`

### Rendering

\`\`\`
POST   /api/v1/projects/:id/render    # Start render job
GET    /api/v1/render/:id             # Get render status
GET    /api/v1/render/:id/download    # Download output
\`\`\`
        `,
      },
      {
        id: 'code-export',
        title: 'Code Export',
        content: `
# Code Export

Export your animation as reusable code in multiple formats:

## Available Formats

- **React** - Full component with Three.js/R3F
- **Vanilla JS** - Plain JavaScript with Three.js
- **HTML** - Standalone HTML file

## React Example

\`\`\`jsx
import { Canvas } from '@react-three/fiber';
import { ParticleSystem } from './ParticleSystem';

export function MyAnimation() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ParticleSystem 
        images={['/image1.jpg', '/image2.jpg']}
        particleCount={50000}
        transitionStyle="morph"
        duration={10}
      />
    </Canvas>
  );
}
\`\`\`

## Configuration Options

All exported code includes configurable options:

- \`particleCount\` - Number of particles
- \`particleSize\` - Size of each particle
- \`transitionStyle\` - Animation style
- \`duration\` - Total animation length
- \`backgroundColor\` - Background color
        `,
      },
    ],
  },
];

export default function Docs() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [activeContent, setActiveContent] = useState('introduction');
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      return (stored as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const currentSection = sections.find(s => s.id === activeSection);
  const currentContent = currentSection?.content.find(c => c.id === activeContent);

  return (
    <>
      <Helmet>
        <title>Documentation - ParticleFX</title>
        <meta name="description" content="Learn how to use ParticleFX to create stunning 3D particle animations. Getting started guides, tutorials, and API reference." />
      </Helmet>

      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <aside className="w-72 border-r border-border/50 bg-card/30 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between mb-4">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <span className="font-bold text-gradient">ParticleFX</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-8 w-8"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-muted/50"
              />
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {sections.map((section) => (
                <div key={section.id}>
                  <button
                    onClick={() => {
                      setActiveSection(section.id);
                      setActiveContent(section.content[0].id);
                    }}
                    className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <section.icon className="h-4 w-4" />
                    {section.title}
                  </button>
                  
                  {activeSection === section.id && (
                    <div className="ml-6 mt-2 space-y-1">
                      {section.content.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveContent(item.id)}
                          className={`block w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${
                            activeContent === item.id
                              ? 'text-foreground bg-muted/50'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {item.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Back to app */}
          <div className="p-4 border-t border-border/50">
            <Link to="/">
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to App
              </Button>
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-8 py-12">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <span>/</span>
              <span>Docs</span>
              <span>/</span>
              <span>{currentSection?.title}</span>
              <span>/</span>
              <span className="text-foreground">{currentContent?.title}</span>
            </div>

            {/* Content */}
            <article className="prose prose-invert max-w-none">
              <div 
                className="space-y-6"
                dangerouslySetInnerHTML={{ 
                  __html: currentContent?.content
                    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mb-6">$1</h1>')
                    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold mt-8 mb-4">$1</h2>')
                    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-medium mt-6 mb-3">$1</h3>')
                    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
                    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-muted text-primary text-sm font-mono">$1</code>')
                    .replace(/```(\w+)?\n([\s\S]+?)```/g, '<pre class="p-4 rounded-lg bg-muted/50 overflow-x-auto my-4"><code class="text-sm font-mono">$2</code></pre>')
                    .replace(/^- (.+)$/gm, '<li class="ml-4 text-muted-foreground">$1</li>')
                    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 text-muted-foreground"><span class="text-primary font-medium">$1.</span> $2</li>')
                    .replace(/\n\n/g, '</p><p class="text-muted-foreground leading-relaxed">')
                    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">$1</blockquote>')
                    || '' 
                }}
              />
            </article>

            {/* Navigation */}
            <div className="flex justify-between mt-12 pt-8 border-t border-border/50">
              <div>
                {/* Previous link would go here */}
              </div>
              <div>
                {/* Next link would go here */}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}