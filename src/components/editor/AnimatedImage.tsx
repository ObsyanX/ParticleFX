import { useState, useEffect, useRef, useMemo, CSSProperties } from 'react';
import { ImageAnimationSettings, defaultImageAnimationSettings, EasingType } from './ImageAnimationControls';

interface AnimatedImageProps {
  src: string;
  alt: string;
  className?: string;
  animationSettings?: ImageAnimationSettings;
  onAnimationComplete?: () => void;
}

type AnimationPhase = 'idle' | 'pre' | 'main' | 'post' | 'complete';

const getEasingValue = (easing: EasingType): string => {
  switch (easing) {
    case 'ease-out': return 'cubic-bezier(0.33, 1, 0.68, 1)';
    case 'ease-in-out': return 'cubic-bezier(0.65, 0, 0.35, 1)';
    case 'cubic-bezier': return 'cubic-bezier(0.16, 1, 0.3, 1)';
    case 'linear': return 'linear';
    case 'spring': return 'cubic-bezier(0.34, 1.56, 0.64, 1)';
    default: return 'ease-out';
  }
};

export function AnimatedImage({ 
  src, 
  alt, 
  className = '',
  animationSettings = defaultImageAnimationSettings,
  onAnimationComplete
}: AnimatedImageProps) {
  const [phase, setPhase] = useState<AnimationPhase>('idle');
  const [isInView, setIsInView] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Check if animations should be disabled
  const shouldAnimate = useMemo(() => {
    if (animationSettings.respectReducedMotion && prefersReducedMotion.current) {
      return false;
    }
    return true;
  }, [animationSettings.respectReducedMotion]);

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Animation sequence controller
  useEffect(() => {
    if (!shouldAnimate) {
      setPhase('complete');
      return;
    }

    if (!isInView) {
      if (animationSettings.replayOnScroll && hasPlayed) {
        setPhase('idle');
        setHasPlayed(false);
      }
      return;
    }

    if (hasPlayed && !animationSettings.replayOnScroll) return;

    // Start animation sequence
    const runSequence = async () => {
      // Pre-animation phase
      if (animationSettings.preAnimationEnabled && animationSettings.preAnimationType !== 'none') {
        setPhase('pre');
        await new Promise(resolve => setTimeout(resolve, animationSettings.preAnimationDuration));
      }

      // Main animation phase
      setPhase('main');
      await new Promise(resolve => setTimeout(resolve, 300)); // Main animation duration

      // Post-animation phase
      if (animationSettings.postAnimationEnabled && animationSettings.postAnimationType !== 'none') {
        await new Promise(resolve => setTimeout(resolve, animationSettings.postAnimationDelay));
        setPhase('post');
        await new Promise(resolve => setTimeout(resolve, animationSettings.postAnimationDuration));
      }

      setPhase('complete');
      setHasPlayed(true);
      onAnimationComplete?.();
    };

    runSequence();
  }, [isInView, shouldAnimate, animationSettings, hasPlayed, onAnimationComplete]);

  // Handle hover replay
  const handleMouseEnter = () => {
    if (animationSettings.replayOnHover && hasPlayed && shouldAnimate) {
      setPhase('idle');
      setHasPlayed(false);
      // Trigger re-run
      setTimeout(() => {
        setIsInView(prev => {
          if (prev) return prev;
          return true;
        });
      }, 50);
    }
  };

  const easing = getEasingValue(animationSettings.easingFunction);

  // Pre-animation styles
  const getPreAnimationStyles = (): CSSProperties => {
    if (!animationSettings.preAnimationEnabled || phase === 'complete') {
      return {};
    }

    const duration = `${animationSettings.preAnimationDuration}ms`;
    const baseTransition = `all ${duration} ${easing}`;

    if (phase === 'idle') {
      switch (animationSettings.preAnimationType) {
        case 'fade-in':
          return { opacity: 0, transition: baseTransition };
        case 'blur-clear':
          return { opacity: 0, filter: 'blur(20px)', transition: baseTransition };
        case 'scale-up':
          return { opacity: 0, transform: 'scale(0.9)', transition: baseTransition };
        case 'slide-top':
          return { opacity: 0, transform: 'translateY(-30px)', transition: baseTransition };
        case 'slide-bottom':
          return { opacity: 0, transform: 'translateY(30px)', transition: baseTransition };
        case 'slide-left':
          return { opacity: 0, transform: 'translateX(-30px)', transition: baseTransition };
        case 'slide-right':
          return { opacity: 0, transform: 'translateX(30px)', transition: baseTransition };
        case 'zoom-fade':
          return { opacity: 0, transform: 'scale(1.1)', filter: 'blur(5px)', transition: baseTransition };
        default:
          return {};
      }
    }

    // Active/completed pre-animation
    return {
      opacity: 1,
      transform: 'translateX(0) translateY(0) scale(1)',
      filter: 'blur(0px)',
      transition: baseTransition,
    };
  };

  // Post-animation styles
  const getPostAnimationStyles = (): CSSProperties => {
    if (!animationSettings.postAnimationEnabled || phase !== 'post') {
      return {};
    }

    const duration = `${animationSettings.postAnimationDuration}ms`;

    switch (animationSettings.postAnimationType) {
      case 'glow-pulse':
        return {
          boxShadow: '0 0 30px hsl(var(--primary) / 0.5)',
          transition: `box-shadow ${duration} ${easing}`,
        };
      case 'border-sweep':
        return {
          boxShadow: 'inset 0 0 0 2px hsl(var(--primary))',
          transition: `box-shadow ${duration} ${easing}`,
        };
      case 'fade-overlay':
        return {};
      case 'scale-bounce':
        return {
          transform: 'scale(1.03)',
          transition: `transform ${duration} ${easing}`,
        };
      case 'shadow-expand':
        return {
          boxShadow: '0 20px 50px hsl(var(--primary) / 0.3)',
          transition: `box-shadow ${duration} ${easing}`,
        };
      default:
        return {};
    }
  };

  const combinedStyles: CSSProperties = {
    ...getPreAnimationStyles(),
    ...(phase === 'post' ? getPostAnimationStyles() : {}),
    willChange: 'transform, opacity, filter',
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      style={combinedStyles}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      
      {/* Fade overlay for post-animation */}
      {phase === 'post' && animationSettings.postAnimationType === 'fade-overlay' && (
        <div 
          className="absolute inset-0 bg-primary/10 pointer-events-none"
          style={{
            animation: `fadeInOut ${animationSettings.postAnimationDuration}ms ${easing}`,
          }}
        />
      )}
    </div>
  );
}

// CSS-in-JS for dynamic keyframes (added to document)
if (typeof document !== 'undefined') {
  const styleId = 'animated-image-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
      }
      
      @keyframes glowPulse {
        0%, 100% { box-shadow: 0 0 20px hsl(var(--primary) / 0.3); }
        50% { box-shadow: 0 0 40px hsl(var(--primary) / 0.6); }
      }
      
      @keyframes borderSweep {
        0% { clip-path: inset(0 100% 100% 0); }
        50% { clip-path: inset(0 0 100% 0); }
        100% { clip-path: inset(0); }
      }
      
      @keyframes scaleBounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.03); }
      }
    `;
    document.head.appendChild(style);
  }
}
