'use client'

import { registerAnalyticsEvent } from '@/lib/google-analytics';
import { useEffect, useRef } from 'react'

export function Price() {
  const ref = useRef<HTMLSpanElement | null>(null);
  const fired = useRef(false)

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired.current) {
          fired.current = true;

          registerAnalyticsEvent(`price_visible`);

          observer.disconnect();
        }
      },
      {
        threshold: 1.0,
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return <span ref={ref}>€39</span>;
}