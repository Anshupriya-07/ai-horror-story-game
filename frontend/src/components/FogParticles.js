import { useMemo } from "react";
import { motion } from "framer-motion";

function FogParticles({ count = 40 }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        size: 40 + Math.random() * 120,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 18 + Math.random() * 22,
        delay: Math.random() * 10,
        opacity: 0.04 + Math.random() * 0.12,
        driftX: (Math.random() - 0.5) * 80,
        driftY: -30 - Math.random() * 60,
      })),
    [count]
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-slate-300 blur-3xl"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
            opacity: p.opacity,
          }}
          animate={{
            x: [0, p.driftX, p.driftX * 0.5, 0],
            y: [0, p.driftY, p.driftY * 0.6, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default FogParticles;
