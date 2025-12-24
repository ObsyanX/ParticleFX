import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { ScrollReveal } from '@/hooks/useScrollReveal';

const plans = [
  {
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    description: 'Perfect for trying out ParticleFX',
    features: [
      '3 projects',
      'Basic particle effects',
      'Watermarked exports',
      '720p resolution',
      'Community support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: { monthly: 19, yearly: 15 },
    description: 'For creators who need more power',
    features: [
      'Unlimited projects',
      'All particle effects',
      'No watermark',
      'Full HD exports (1080p)',
      'Priority support',
      'Custom backgrounds',
      'Advanced timeline controls',
    ],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Studio',
    price: { monthly: 49, yearly: 39 },
    description: 'For teams and professionals',
    features: [
      'Everything in Pro',
      '4K exports',
      'API access (coming soon)',
      'Team collaboration',
      'Custom branding',
      'Dedicated support',
      'Early access to features',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Pricing</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            Simple, Transparent{' '}
            <span className="text-gradient">Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Start free and upgrade when you need more power.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                isYearly ? 'bg-primary' : 'bg-muted'
              }`}
              aria-label="Toggle yearly billing"
            >
              <div
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Yearly
              <span className="ml-1 text-xs text-primary">(Save 20%)</span>
            </span>
          </div>
        </ScrollReveal>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <ScrollReveal key={plan.name} delay={index * 0.1}>
              <div
                className={`relative p-6 rounded-2xl transition-all duration-300 h-full ${
                  plan.popular
                    ? 'bg-card border-2 border-primary shadow-2xl shadow-primary/20 scale-105'
                    : 'glass hover:bg-card/90'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    Most Popular
                  </div>
                )}

                {/* Plan name */}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    ${isYearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className="text-muted-foreground">/month</span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  onClick={() => navigate('/auth')}
                  className={`w-full ${
                    plan.popular
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground glow-primary'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {plan.cta}
                </Button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}