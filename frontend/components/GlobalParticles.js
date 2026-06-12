/* eslint-disable react-hooks/set-state-in-effect */
'use client';
import { useEffect, useState } from 'react';

const BASE_PARTICLES = [
  '{ }', '< />', 'fn()', '[ ]', '===', '&&', '=>', '++', '/**/', '0x1F', 'null', '()', 
  'async', 'await', 'console.log', 'import', 'export', 'class', 'let', 'const', 'return'
];

export default function GlobalParticles() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generar partículas en el cliente para evitar Hydration Error
    const generatedParticles = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      text: BASE_PARTICLES[Math.floor(Math.random() * BASE_PARTICLES.length)],
      left: `${Math.random() * 100}%`,
      duration: `${15 + Math.random() * 20}s`,
      delay: `${Math.random() * -20}s`,
      color: Math.random() > 0.5 ? 'var(--primary-light)' : 'var(--accent-light)',
      fontSize: `${0.8 + Math.random() * 1.5}rem`
    }));
    setParticles(generatedParticles);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle absolute whitespace-nowrap font-mono"
          style={{
            left: p.left,
            animationDuration: p.duration,
            animationDelay: p.delay,
            color: p.color,
            fontSize: p.fontSize,
          }}
        >
          {p.text}
        </span>
      ))}
    </div>
  );
}
