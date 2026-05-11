'use client';

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 md:h-1.5 bg-gradient-to-r from-[#C1A68D] via-[#D5C5B3] to-[#C1A68D] origin-left z-[1000]"
      style={{ scaleX }}
    />
  );
}
