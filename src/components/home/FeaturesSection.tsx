import { Eye, Layers, Sparkles, Clock, Download, DollarSign } from 'lucide-react';

const features = [
  {
    icon: Eye,
    title: 'Live 3D Preview',
    description: 'See your animations instantly with real-time WebGL rendering.',
  },
  {
    icon: Layers,
    title: 'Multi-Image Transitions',
    description: 'Smoothly morph between multiple images using particle-based effects.',
  },
  {
    icon: Sparkles,
    title: 'Particle Effects Engine',
    description: 'Explode, swirl, morph, and add depth using advanced particle systems.',
  },
  {
    icon: Clock,
    title: 'Timeline-Based Control',
    description: 'Sequence images and transitions with an intuitive timeline.',
  },
  {
    icon: Download,
    title: 'Export & Download',
    description: 'Export your creations as videos or reusable animation code.',
  },
  {
    icon: DollarSign,
    title: 'Monetization Ready',
    description: 'Built for creators, teams, and scalable production workflows.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Features</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            Everything You Need to Create{' '}
            <span className="text-gradient">Stunning Animations</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Professional-grade tools designed for creators who want cinematic quality without the complexity.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-6 rounded-2xl glass hover:bg-card/90 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}