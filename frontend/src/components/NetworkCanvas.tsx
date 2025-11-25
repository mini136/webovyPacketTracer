import { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  addEdge,
  type NodeTypes,
  ConnectionMode,
  BackgroundVariant,
  type Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import DeviceNode from './DeviceNode';
import PacketAnimation from './PacketAnimation';
import { useNetworkStore, type DeviceNode as DeviceNodeType } from '../store/networkStore';

const nodeTypes: NodeTypes = {
  device: DeviceNode,
};

export default function NetworkCanvas() {
  const { nodes, edges, setEdges, setSelectedNode } = useNetworkStore();
  const [localNodes, setLocalNodes, onNodesChange] = useNodesState([]);
  const [localEdges, setLocalEdges, onEdgesChange] = useEdgesState([]);

  // Vytvoř serialized verzi pro porovnání
  const nodesKey = useMemo(() => 
    JSON.stringify(nodes.map(n => ({ id: n.id, data: n.data }))),
    [nodes]
  );

  // Sync nodes pouze když se změní struktura nebo data (ne pozice)
  useEffect(() => {
    setLocalNodes(prevNodes => {
      // První inicializace
      if (prevNodes.length === 0 && nodes.length > 0) {
        return nodes;
      }

      // Pokud se změnil počet nebo ID nodů
      if (prevNodes.length !== nodes.length) {
        return nodes;
      }

      // Updatuj pouze data, zachovej pozice
      return prevNodes.map(localNode => {
        const storeNode = nodes.find(n => n.id === localNode.id);
        if (!storeNode) return localNode;
        
        // Pouze pokud se data liší, updatuj
        if (JSON.stringify(localNode.data) !== JSON.stringify(storeNode.data)) {
          return { ...localNode, data: storeNode.data };
        }
        
        return localNode;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodesKey, setLocalNodes]);

  // Sync edges
  useEffect(() => {
    setLocalEdges(edges);
  }, [edges, setLocalEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      // Normalizuj handle ID (odstraň -in suffix pro porovnání)
      const normalizeHandleId = (handleId: string | null | undefined) => {
        if (!handleId) return handleId;
        return handleId.replace('-in', '');
      };
      
      const sourceHandleNormalized = normalizeHandleId(params.sourceHandle);
      const targetHandleNormalized = normalizeHandleId(params.targetHandle);
      
      // Kontrola zda source port už není obsazený
      const sourcePortOccupied = localEdges.some(edge => {
        const edgeSourceNormalized = normalizeHandleId(edge.sourceHandle);
        return edge.source === params.source && edgeSourceNormalized === sourceHandleNormalized;
      });
      
      // Kontrola zda target port už není obsazený
      const targetPortOccupied = localEdges.some(edge => {
        const edgeTargetNormalized = normalizeHandleId(edge.targetHandle);
        return edge.target === params.target && edgeTargetNormalized === targetHandleNormalized;
      });

      if (sourcePortOccupied) {
        alert('❌ Tento port je již obsazený!');
        return;
      }

      if (targetPortOccupied) {
        alert('❌ Cílový port je již obsazený!');
        return;
      }

      const newEdges = addEdge({
        ...params,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
        animated: true,
      }, localEdges);
      setEdges(newEdges);
    },
    [localEdges, setEdges]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node as DeviceNodeType);
    },
    [setSelectedNode]
  );

  return (
    <div style={{ width: '100%', height: '100%', background: '#f8fafc', position: 'relative' }}>
      <ReactFlow
        nodes={localNodes}
        edges={localEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        style={{ background: '#f8fafc' }}
      >
        <Background 
          variant={BackgroundVariant.Dots}
          gap={14}
          size={0.7}
          color="#cbd5e1"
        />
        <Controls />
        <MiniMap 
          style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            width: 140,
            height: 100,
          }}
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              router: '#2563eb',
              switch: '#059669',
              pc: '#7c3aed',
              server: '#dc2626',
              hub: '#ea580c',
            };
            return colors[node.data.type] || '#6b7280';
          }}
        />
      </ReactFlow>
      <PacketAnimation />
    </div>
  );
}
