'use client';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useEffect, useMemo } from 'react';
import NodeCard from './NodeCard';

// Definiendo nodeTypes fuera del componente evita el re-render infinito (warning reactflow)
const nodeTypes = { customNode: NodeCard };

const getLevelColor = (level) => {
  switch (level) {
    case 'Básico': return '#22c55e'; // green-500
    case 'Intermedio': return '#f97316'; // orange-500
    case 'Avanzado': return '#ef4444'; // red-500
    default: return '#60A5FA';
  }
};

export default function RoadmapCanvas({ roadmapNodes, selectedNodeId, onNodeSelect }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Calculate Tree Layout
  const calculateLayout = (nodesData) => {
    // 1. Build adjacency list and find roots
    const adj = {};
    const inDegree = {};
    const nodeMap = {};
    
    nodesData.forEach(n => {
      nodeMap[n.id] = n;
      adj[n.id] = [];
      if (!(n.id in inDegree)) inDegree[n.id] = 0;
    });

    nodesData.forEach(n => {
      (n.dependsOn || []).forEach(depId => {
        if (!adj[depId]) adj[depId] = [];
        adj[depId].push(n.id);
        inDegree[n.id] = (inDegree[n.id] || 0) + 1;
      });
    });

    // 2. Assign depths (BFS)
    const depths = {};
    const queue = [];
    nodesData.forEach(n => {
      if (inDegree[n.id] === 0) {
        queue.push({ id: n.id, depth: 0 });
      }
    });

    let maxDepth = 0;
    while (queue.length > 0) {
      const { id, depth } = queue.shift();
      if (depths[id] === undefined || depth > depths[id]) {
        depths[id] = depth;
        maxDepth = Math.max(maxDepth, depth);
        (adj[id] || []).forEach(childId => {
          queue.push({ id: childId, depth: depth + 1 });
        });
      }
    }

    // 3. Assign X positions based on depth
    const nodesAtDepth = {};
    for (let i = 0; i <= maxDepth; i++) nodesAtDepth[i] = [];
    nodesData.forEach(n => {
      const d = depths[n.id] !== undefined ? depths[n.id] : 0;
      nodesAtDepth[d].push(n.id);
    });

    const SPACING_X = 280;
    const SPACING_Y = 160;

    const positions = {};
    for (let d = 0; d <= maxDepth; d++) {
      const levelNodes = nodesAtDepth[d];
      const width = levelNodes.length * SPACING_X;
      let startX = -(width / 2) + (SPACING_X / 2);
      
      levelNodes.forEach((id) => {
        positions[id] = { x: startX, y: d * SPACING_Y };
        startX += SPACING_X;
      });
    }

    return positions;
  };

  useEffect(() => {
    if (!roadmapNodes?.length) return;

    const positions = calculateLayout(roadmapNodes);

    const rfNodes = roadmapNodes.map((n, i) => {
      const isSelected = selectedNodeId === n.id;
      return {
        id: n.id,
        type: 'customNode',
        position: positions[n.id] || { x: 0, y: i * 150 },
        data: {
          ...n,
          selected: isSelected,
          onSelect: onNodeSelect
        },
        style: {
          opacity: selectedNodeId && !isSelected ? 0.4 : 1,
          transition: 'opacity 0.3s ease',
          zIndex: isSelected ? 100 : 1,
        }
      };
    });

    const rfEdges = [];
    roadmapNodes.forEach((n) => {
      const targetColor = getLevelColor(n.level);
      (n.dependsOn || []).forEach((sourceId) => {
        rfEdges.push({
          id: `${sourceId}->${n.id}`,
          source: sourceId,
          target: n.id,
          type: 'smoothstep',
          animated: true,
          style: {
            stroke: targetColor,
            strokeWidth: 2.5,
            filter: `drop-shadow(0 0 4px ${targetColor}80)`,
            opacity: selectedNodeId && (selectedNodeId !== n.id && selectedNodeId !== sourceId) ? 0.2 : 0.8,
            transition: 'opacity 0.3s ease'
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: targetColor,
            width: 15,
            height: 15,
          },
        });
      });
    });

    setNodes(rfNodes);
    setEdges(rfEdges);
  }, [roadmapNodes, selectedNodeId, onNodeSelect, setNodes, setEdges]);

  // Encontrar el primer nodo (raíz) para enfocar
  const rootNodeId = roadmapNodes?.[0]?.id;

  return (
    <div className="w-full h-full min-h-[75vh] rounded-2xl overflow-hidden border border-white/10 bg-[#060e20] shadow-2xl relative transition-all duration-300">
      {/* Decorative gradient orb for the canvas */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={
          rootNodeId 
            ? { nodes: [{ id: rootNodeId }], padding: 0.2, maxZoom: 1.2 } 
            : { padding: 0.4, minZoom: 0.5, maxZoom: 1.2 }
        }
        className="z-10"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1e293b" gap={30} size={2} />
        <Controls 
          className="bg-[#171f33] border-white/10 fill-white shadow-lg"
          showInteractive={false}
        />
        <MiniMap
          nodeColor={(n) => {
            const level = n.data?.level;
            return level === 'Básico' ? '#22c55e' : level === 'Intermedio' ? '#f97316' : level === 'Avanzado' ? '#ef4444' : '#3B82F6';
          }}
          maskColor="rgba(6, 14, 32, 0.85)"
          className="bg-[#0b1326] border-white/10"
        />

        {/* Level Legend */}
        <div className="absolute bottom-6 left-6 z-50 flex items-center gap-4 bg-[#171f33]/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Básico</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Intermedio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Avanzado</span>
          </div>
        </div>

      </ReactFlow>
    </div>
  );
}
