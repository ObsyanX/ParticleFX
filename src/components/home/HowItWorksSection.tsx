import { Upload, Atom, Play, Download } from 'lucide-react';
import { ScrollReveal } from '@/hooks/useScrollReveal';

const steps = [
  {
    icon: Upload,
    number: '01',
    title: 'Upload Images',
    description: 'Drag and drop your images or select from your device. Supports all major formats.',
  },
  {
    icon: Atom,
    number: '02',
    title: 'Convert to Particles',
    description: 'Our engine analyzes your images and creates thousands of intelligent particles.',
  },
  {
    icon: Play,
    number: '03',
    title: 'Animate in 3D',
    description: 'Choose transition styles, adjust timing, and preview your animation in real-time.',
  },
  {
    icon: Download,
    number: '04',
    title: 'Export Video',
    description: 'Download your creation as a high-quality video ready for any platform.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-muted/30" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">How It Works</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            From Image to Video in{' '}
            <span className="text-gradient">4 Simple Steps</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            No complex software, no learning curve. Just upload, customize, and export.
          </p>
        </ScrollReveal>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <ScrollReveal key={step.number} delay={index * 0.15}>
                <div className="relative group">
                  {/* Card */}
                  <div className="relative p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                    {/* Step number */}
                    <div className="absolute -top-4 left-6 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mt-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold mb-2">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow connector */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-4 w-8 h-8 items-center justify-center -translate-y-1/2 z-10">
                      <div className="w-0 h-0 border-t-8 border-b-8 border-l-8 border-transparent border-l-primary/50" />
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}