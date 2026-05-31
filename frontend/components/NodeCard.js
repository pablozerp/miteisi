import { Handle, Position } from 'reactflow';

const levelColors = {
  'Básico': { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' },
  'Intermedio': { bg: 'rgba(209, 105, 0, 0.15)', text: '#D16900', border: 'rgba(209, 105, 0, 0.3)' },
  'Avanzado': { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
};

export default function NodeCard({ data }) {
  const colors = levelColors[data.level] || levelColors['Básico'];

  return (
    <div
      className="rounded-2xl p-4 w-72 shadow-xl transition-all duration-300 hover:scale-[1.02]"
      style={{
        background: 'rgba(23, 31, 51, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3B82F6'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'; }}
    >
      {/* React Flow Handles */}
      <Handle type="target" position={Position.Top} style={{ background: '#3B82F6', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#3B82F6', width: 8, height: 8 }} />

      {/* Level Badge */}
      <span
        className="text-xs px-2.5 py-1 rounded-full font-medium inline-block mb-2"
        style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
      >
        {data.level}
      </span>

      {/* Title */}
      <h3 className="font-bold text-base mb-1" style={{ color: '#dae2fd' }}>{data.title}</h3>

      {/* Description */}
      <p className="text-xs mb-3 line-clamp-2" style={{ color: '#8b95b0' }}>{data.description}</p>

      {/* Topics */}
      {data.topics?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {data.topics.slice(0, 3).map((t, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6' }}
            >
              {t}
            </span>
          ))}
          {data.topics.length > 3 && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: '#8b95b0' }}>
              +{data.topics.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Documentation */}
      {data.documentation?.length > 0 && (
        <div className="mb-2">
          <p className="text-xs font-semibold mb-1" style={{ color: '#8b95b0' }}>📄 Documentación:</p>
          {data.documentation.slice(0, 2).map((doc, i) => (
            <a
  key={i}
  href={`https://www.google.com/search?q=${encodeURIComponent(doc.url)}`}
  target="_blank"
  rel="noopener noreferrer"
  className="block text-xs truncate hover:underline"
  style={{ color: '#3B82F6' }}
>
  {doc.title}
</a>
          ))}
        </div>
      )}

      {/* Videos */}
      {data.videos?.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: '#8b95b0' }}>🎥 Videos:</p>
          {data.videos.slice(0, 2).map((v, i) => (
            <a
              key={i}
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs truncate hover:underline"
              style={{ color: '#D16900' }}
            >
              ▶ {v.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
