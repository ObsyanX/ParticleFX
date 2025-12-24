import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ScrollReveal } from '@/hooks/useScrollReveal';

export function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      
      {/* Floating particles decoration */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-primary/30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/20 mb-8 animate-pulse-glow">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
            Bring Your Images to Life{' '}
            <span className="text-gradient">in 3D</span>
          </h2>

          {/* Subtext */}
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start creating cinematic particle animations in minutes. No credit card required.
          </p>

          {/* CTA */}
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="text-lg px-10 py-6 bg-primary hover:bg-primary/90 text-primary-foreground glow-primary group"
          >
            Create Your First Project
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          {/* Trust signals */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              Free to start
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              Cancel anytime
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}