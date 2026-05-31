'use client';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useEffect } from 'react';
import NodeCard from './NodeCard';

// Registrar el tipo de nodo personalizado
const nodeTypes = { customNode: NodeCard };

export default function RoadmapCanvas({ roadmapNodes }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!roadmapNodes?.length) return;
    // Debug: mostrar payload real en consola para verificar documentación/videos
    try {
      if (typeof window !== 'undefined') console.log('RoadmapCanvas - roadmapNodes:', roadmapNodes);
    } catch (e) {}

    // Convertir nodos de Gemini al formato de React Flow
    const rfNodes = roadmapNodes.map((n) => ({
      id: n.id,
      type: 'customNode',
      position: n.position || { x: 0, y: 0 },
      data: {
        title: n.title,
        description: n.description,
        level: n.level,
        topics: n.topics,
        documentation: n.documentation,
        videos: n.videos,
      },
    }));

    // Generar aristas (conexiones) a partir de dependsOn
    const rfEdges = [];
    roadmapNodes.forEach((n) => {
      (n.dependsOn || []).forEach((sourceId) => {
        rfEdges.push({
          id: `${sourceId}->${n.id}`,
          source: sourceId,
          target: n.id,
          animated: true,
          style: {
            stroke: '#3B82F6',
            strokeWidth: 2,
          },
        });
      });
    });

    setNodes(rfNodes);
    setEdges(rfEdges);
  }, [roadmapNodes]);

  return (
    <div
      className="w-full rounded-2xl overflow-hidden"
      style={{
        height: '70vh',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: '#060e20',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
      >
        <Background color="#1e293b" gap={20} size={1} />
        <Controls />
        <MiniMap
          nodeColor="#3B82F6"
          maskColor="rgba(6, 14, 32, 0.8)"
          style={{ background: '#0b1326' }}
        />
      </ReactFlow>
    </div>
  );
}
