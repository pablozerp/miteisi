import { Handle, Position } from 'reactflow';

const levelStyles = {
  'Básico': {
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    border: 'border-green-500/30',
    glowActive: 'shadow-[0_0_20px_-3px_rgba(34,197,94,0.4)] border-green-500/70',
    bar: 'from-green-400 to-green-600',
    dot: 'bg-green-400',
  },
  'Intermedio': {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    glowActive: 'shadow-[0_0_20px_-3px_rgba(249,115,22,0.4)] border-orange-500/70',
    bar: 'from-orange-400 to-orange-600',
    dot: 'bg-orange-400',
  },
  'Avanzado': {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/30',
    glowActive: 'shadow-[0_0_20px_-3px_rgba(239,68,68,0.4)] border-red-500/70',
    bar: 'from-red-400 to-red-600',
    dot: 'bg-red-400',
  },
};

// Badge de color para el lenguaje (A=azul, B=naranja, sin prefijo=sin badge)
const getLangBadge = (nodeId = '') => {
  if (nodeId.startsWith('a-')) return { label: 'A', cls: 'bg-blue-500 text-white' };
  if (nodeId.startsWith('b-')) return { label: 'B', cls: 'bg-orange-500 text-white' };
  return null;
};

export default function NodeCard({ data }) {
  const style = levelStyles[data.level] || levelStyles['Básico'];
  const isSelected = data.selected;
  const totalResources = (data.documentation?.length || 0) + (data.videos?.length || 0);
  const langBadge = getLangBadge(data.id);

  return (
    <div
      onClick={() => data.onSelect && data.onSelect(data)}
      className={`group cursor-pointer rounded-2xl w-[230px] bg-[#171f33]/90 backdrop-blur-xl transition-all duration-300 relative overflow-hidden flex flex-col ${
        isSelected
          ? `scale-105 border ${style.glowActive} z-20`
          : 'border border-white/10 hover:-translate-y-1 hover:border-white/30 hover:shadow-lg'
      }`}
    >
      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-slate-400 !w-1.5 !h-1.5 !border-0 opacity-50 group-hover:opacity-100 group-hover:bg-blue-400 transition-colors"
      />

      {/* Content */}
      <div className="p-4 flex-1">
        {/* Level badge + optional language badge */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {data.level}
          </span>
          {langBadge && (
            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase ${langBadge.cls}`}>
              {langBadge.label}
            </span>
          )}
          {data.lang && !langBadge && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 uppercase truncate max-w-[70px]">
              {data.lang}
            </span>
          )}
        </div>

        <h3 className={`font-bold text-base leading-tight transition-colors line-clamp-2 ${isSelected ? 'text-white' : 'text-[#dae2fd] group-hover:text-blue-300'}`}>
          {data.title}
        </h3>

        {/* Resource badges */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5 flex-wrap">
          {data.topics?.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium bg-white/5 px-1.5 py-0.5 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg> {data.topics.length}
            </div>
          )}
          {totalResources > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium bg-white/5 px-1.5 py-0.5 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg> {totalResources}
            </div>
          )}
          {isSelected && (
            <span className="ml-auto text-[9px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
              Activo
            </span>
          )}
        </div>
      </div>

      {/* Progress/Level bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${style.bar} opacity-70 group-hover:opacity-100 transition-opacity`} />

      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-slate-400 !w-1.5 !h-1.5 !border-0 opacity-50 group-hover:opacity-100 group-hover:bg-blue-400 transition-colors"
      />
    </div>
  );
}
