'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
}

export default function ScrollReveal({ 
  children, 
  width = "100%", 
  delay = 0,
  direction = "up",
  distance = 50
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const variants = {
    hidden: { 
      opacity: 0, 
      y: direction === "up" ? distance : direction === "down" ? -distance : 0,
      x: direction === "left" ? distance : direction === "right" ? -distance : 0
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      x: 0 
    }
  };

  return (
    <div ref={ref} style={{ position: "relative", width, overflow: "hidden" }}>
      <motion.div
        variants={variants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ duration: 0.8, delay, ease: [0.17, 0.55, 0.55, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}
