import { Star } from 'lucide-react';
import { ScrollReveal } from '@/hooks/useScrollReveal';

const testimonials = [
  {
    quote: "ParticleFX transformed how I create content. The particle effects are absolutely stunning and so easy to use.",
    author: "Sarah Chen",
    role: "Content Creator",
    avatar: "SC",
  },
  {
    quote: "Finally, a tool that makes 3D animations accessible. My client presentations have never looked better.",
    author: "Marcus Johnson",
    role: "Marketing Director",
    avatar: "MJ",
  },
  {
    quote: "The real-time preview is a game changer. I can iterate on animations in seconds instead of hours.",
    author: "Emily Rodriguez",
    role: "Motion Designer",
    avatar: "ER",
  },
];

const trustedBy = [
  'CreativeStudio',
  'DigitalAgency',
  'MediaHouse',
  'BrandLabs',
  'VisualCraft',
];

export function TestimonialsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-muted/20" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            Loved by{' '}
            <span className="text-gradient">Creators Worldwide</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of creators, developers, and marketers using ParticleFX.
          </p>
        </ScrollReveal>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {testimonials.map((testimonial, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <div className="p-6 rounded-2xl glass hover:bg-card/90 transition-all duration-300 h-full">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-foreground/90 mb-6">"{testimonial.quote}"</p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-medium">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Trusted by */}
        <ScrollReveal delay={0.3}>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-8">Trusted by creative teams worldwide</p>
            <div className="flex flex-wrap justify-center gap-8 items-center opacity-50">
              {trustedBy.map((company) => (
                <div
                  key={company}
                  className="text-xl font-bold text-muted-foreground/50"
                >
                  {company}
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}