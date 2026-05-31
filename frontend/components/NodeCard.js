import { Handle, Position } from 'reactflow';

const levelStyles = {
  'Básico': {
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    border: 'border-green-500/30',
    glowActive: 'shadow-[0_0_20px_-3px_rgba(34,197,94,0.4)] border-green-500/70',
    bar: 'from-green-400 to-green-600',
  },
  'Intermedio': {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    glowActive: 'shadow-[0_0_20px_-3px_rgba(249,115,22,0.4)] border-orange-500/70',
    bar: 'from-orange-400 to-orange-600',
  },
  'Avanzado': {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/30',
    glowActive: 'shadow-[0_0_20px_-3px_rgba(239,68,68,0.4)] border-red-500/70',
    bar: 'from-red-400 to-red-600',
  },
};

export default function NodeCard({ data }) {
  const style = levelStyles[data.level] || levelStyles['Básico'];
  const isSelected = data.selected;

  const totalResources = (data.documentation?.length || 0) + (data.videos?.length || 0);

  return (
    <div 
      onClick={() => data.onSelect && data.onSelect(data)}
      className={`group cursor-pointer rounded-2xl w-[220px] bg-[#171f33]/90 backdrop-blur-xl transition-all duration-300 relative overflow-hidden flex flex-col ${
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
        <span className={`inline-block text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border mb-2 ${style.bg} ${style.text} ${style.border}`}>
          {data.level}
        </span>
        <h3 className={`font-bold text-base leading-tight transition-colors ${isSelected ? 'text-white' : 'text-[#dae2fd] group-hover:text-blue-300'}`}>
          {data.title}
        </h3>
        
        {/* Badges */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
          {data.topics?.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium bg-white/5 px-1.5 py-0.5 rounded">
              <span>📚</span> {data.topics.length}
            </div>
          )}
          {totalResources > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium bg-white/5 px-1.5 py-0.5 rounded">
              <span>🔗</span> {totalResources}
            </div>
          )}
        </div>
      </div>

      {/* Progress / Level Bar at bottom */}
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
