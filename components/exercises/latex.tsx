'use client'

import katex from 'katex';
import { useEffect, useRef } from 'react';

interface LatexProps {
  children: string
}

export function Latex({ children: text }: LatexProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      katex.render(text, ref.current, {
        throwOnError: false,
        displayMode: true,
        output: "mathml"
      });
    }
  }, [text]);

  return <div className='px-2' ref={ref}></div>;
}