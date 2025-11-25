import { useNetworkStore } from '../store/networkStore';
import { topologyApi, deviceApi, connectionApi } from '../api/api';
import { useState } from 'react';

export default function SaveLoadPanel() {
  const { nodes, edges, setNodes, setEdges, topologyId, setTopologyId } = useNetworkStore();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [topologyName, setTopologyName] = useState('Moje síť');

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Vytvoř nebo updatuj topologii
      let topoId: string | null = topologyId;
      if (!topoId) {
        const response = await topologyApi.create({
          name: topologyName,
          userId: 'demo-user', // TODO: Replace with real user
          description: 'Network topology',
        });
        topoId = response.data._id;
      }
      
      if (!topoId) {
        throw new Error('Failed to create or load topology');
      }
      
      setTopologyId(topoId);

      // 2. Ulož všechna zařízení
      for (const node of nodes) {
        await deviceApi.create({
          name: node.data.label,
          type: node.data.type,
          positionX: node.position.x,
          positionY: node.position.y,
          topologyId: topoId,
          interfaces: node.data.interfaces,
        });
      }

      // 3. Ulož propojení
      for (const edge of edges) {
        await connectionApi.create({
          sourceDeviceId: edge.source,
          sourcePort: edge.sourceHandle || 'port-0',
          targetDeviceId: edge.target,
          targetPort: edge.targetHandle || 'port-0',
          sourceInterface: 'eth0',
          targetInterface: 'eth0',
          cableType: 'straight',
          topologyId: topoId,
        });
      }

      alert('✅ Topologie uložena!');
    } catch (error) {
      console.error('Chyba při ukládání:', error);
      alert('❌ Chyba při ukládání topologie');
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = async () => {
    setLoading(true);
    try {
      // Načti topologie uživatele
      const topologies = await topologyApi.getAll('demo-user');
      if (topologies.data.length === 0) {
        alert('Žádné uložené topologie');
        return;
      }

      const topoId = topologies.data[0]._id;
      setTopologyId(topoId);

      // Načti zařízení
      const devicesResponse = await deviceApi.getByTopology(topoId);
      const devices = devicesResponse.data;

      // Převeď na nodes
      const loadedNodes = devices.map((device: { _id: string; name: string; type: string; positionX: number; positionY: number; interfaces: unknown[] }) => ({
        id: device._id,
        type: 'device',
        position: { x: device.positionX, y: device.positionY },
        data: {
          label: device.name,
          type: device.type,
          interfaces: device.interfaces || [],
        },
      }));

      // Načti propojení
      const connectionsResponse = await connectionApi.getByTopology(topoId);
      const connections = connectionsResponse.data;

      // Převeď na edges
      const loadedEdges = connections.map((conn: { _id: string; sourceDeviceId: string; targetDeviceId: string; sourcePort?: string; targetPort?: string }) => ({
        id: conn._id,
        source: conn.sourceDeviceId,
        target: conn.targetDeviceId,
        type: 'default',
        animated: true,
      }));

      setNodes(loadedNodes);
      setEdges(loadedEdges);

      alert('✅ Topologie načtena!');
    } catch (error) {
      console.error('Chyba při načítání:', error);
      alert('❌ Chyba při načítání topologie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <input
        type="text"
        value={topologyName}
        onChange={(e) => setTopologyName(e.target.value)}
        placeholder="Název topologie"
        style={{
          padding: '6px 8px',
          borderRadius: '4px',
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(255,255,255,0.1)',
          color: 'white',
          fontSize: '9px',
          width: '105px',
        }}
      />
      
      <button
        onClick={handleLoad}
        disabled={loading}
        style={{
          padding: '6px 11px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '4px',
          color: '#60a5fa',
          fontSize: '9px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1,
        }}
      >
        {loading ? '⏳ Načítám...' : '📂 Načíst'}
      </button>
      
      <button
        onClick={handleSave}
        disabled={saving || nodes.length === 0}
        style={{
          padding: '6px 11px',
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          border: 'none',
          borderRadius: '4px',
          color: 'white',
          fontSize: '9px',
          fontWeight: '600',
          cursor: saving || nodes.length === 0 ? 'not-allowed' : 'pointer',
          opacity: saving || nodes.length === 0 ? 0.5 : 1,
        }}
      >
        {saving ? '⏳ Ukládám...' : '💾 Uložit'}
      </button>
    </div>
  );
}
