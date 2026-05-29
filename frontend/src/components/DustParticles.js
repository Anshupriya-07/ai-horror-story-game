import { useMemo } from "react";

function DustParticles({ count = 28 }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1 + Math.random() * 2,
        duration: 12 + Math.random() * 18,
        delay: Math.random() * 8,
        opacity: 0.04 + Math.random() * 0.08,
        driftX: (Math.random() - 0.5) * 40,
        driftY: -20 - Math.random() * 35,
      })),
    [count]
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="dust-particle absolute rounded-full bg-amber-100/30"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            "--dust-x": `${p.driftX}px`,
            "--dust-y": `${p.driftY}px`,
          }}
        />
      ))}
    </div>
  );
}

export default DustParticles;
