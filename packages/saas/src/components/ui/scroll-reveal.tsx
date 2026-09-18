import { motion, useInView, Variants } from "framer-motion";
import { CSSProperties, ReactNode, useLayoutEffect, useRef, useState } from "react";
import { isFirstRenderOverPrerender, isPrerendering } from "@/lib/prerender";

type AnimationVariant = "fadeUp" | "fadeDown" | "fadeLeft" | "fadeRight" | "fade" | "scale";

interface ScrollRevealProps {
  children: ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

// Hiding is instant: it only ever happens off screen (see useReveal).
const hide = { duration: 0 };

const variants: Record<AnimationVariant, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 40, transition: hide },
    visible: { opacity: 1, y: 0 },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -40, transition: hide },
    visible: { opacity: 1, y: 0 },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -40, transition: hide },
    visible: { opacity: 1, x: 0 },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 40, transition: hide },
    visible: { opacity: 1, x: 0 },
  },
  fade: {
    hidden: { opacity: 0, transition: hide },
    visible: { opacity: 1 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.9, transition: hide },
    visible: { opacity: 1, scale: 1 },
  },
};

/**
 * Reveal-on-scroll state for a motion element.
 *
 * Normally the element starts hidden and animates in when scrolled into
 * view. Two cases start it visible instead: the build-time prerender (its
 * snapshot must not contain hidden content) and the first render over a
 * prerendered page (the content is already on screen). In the second case,
 * elements that turn out to be below the fold are hidden again before the
 * browser paints, so they still reveal on scroll.
 */
function useReveal(once: boolean, margin: string) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: margin as `${number}px` });
  const [startVisible] = useState(() => isPrerendering || isFirstRenderOverPrerender());
  const [armed, setArmed] = useState(!startVisible);

  useLayoutEffect(() => {
    if (armed || isPrerendering) return;
    const el = ref.current;
    if (el && el.getBoundingClientRect().top > window.innerHeight) {
      setArmed(true);
    }
    // Only measured once, at mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ref,
    initial: startVisible ? (false as const) : 'hidden',
    animate: !armed || inView ? 'visible' : 'hidden',
  };
}

export function ScrollReveal({
  children,
  variant = "fadeUp",
  delay = 0,
  duration = 0.5,
  className = "",
  once = true,
}: ScrollRevealProps) {
  const reveal = useReveal(once, "-100px");

  return (
    <motion.div
      ref={reveal.ref}
      initial={reveal.initial}
      animate={reveal.animate}
      variants={variants[variant]}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Staggered children animation wrapper
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  staggerDelay?: number;
  once?: boolean;
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, transition: hide },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
};

export function StaggerContainer({
  children,
  className = "",
  style,
  staggerDelay = 0.1,
  once = true,
}: StaggerContainerProps) {
  const reveal = useReveal(once, "-50px");

  return (
    <motion.div
      ref={reveal.ref}
      initial={reveal.initial}
      animate={reveal.animate}
      variants={{
        hidden: { opacity: 0, transition: hide },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <motion.div variants={itemVariants} className={className} style={style}>
      {children}
    </motion.div>
  );
}
