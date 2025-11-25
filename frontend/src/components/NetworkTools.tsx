import { useState } from 'react';
import { useNetworkStore } from '../store/networkStore';

interface NetworkToolsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NetworkTools({ isOpen, onClose }: NetworkToolsProps) {
  const { nodes, edges, addPacket, clearPackets } = useNetworkStore();
  const [sourceDevice, setSourceDevice] = useState('');
  const [targetIp, setTargetIp] = useState('');
  const [pingResult, setPingResult] = useState<string[]>([]);
  const [tracerouteResult, setTracerouteResult] = useState<Array<{ hop: number; device: string; ip: string; rtt: number }>>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Najdi cestu mezi zařízeními pomocí BFS
  const findPath = (sourceId: string, targetIp: string): string[] | null => {
    const source = nodes.find(n => n.id === sourceId);
    if (!source) return null;

    // Najdi cílové zařízení podle IP
    const target = nodes.find(n => 
      n.data.interfaces.some(i => i.ipAddress === targetIp)
    );
    if (!target) return null;

    // BFS algoritmus pro nalezení cesty
    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; path: string[] }> = [
      { nodeId: sourceId, path: [sourceId] }
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (current.nodeId === target.id) {
        return current.path;
      }

      if (visited.has(current.nodeId)) continue;
      visited.add(current.nodeId);

      // Najdi sousedy
      const neighbors = edges
        .filter(e => e.source === current.nodeId || e.target === current.nodeId)
        .map(e => e.source === current.nodeId ? e.target : e.source);

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push({
            nodeId: neighbor,
            path: [...current.path, neighbor]
          });
        }
      }
    }

    return null;
  };

  const handlePing = () => {
    setIsRunning(true);
    setPingResult([]);
    setTracerouteResult([]);
    clearPackets();

    setTimeout(() => {
      const path = findPath(sourceDevice, targetIp);
      
      if (!path) {
        setPingResult([
          'Ping request could not find host ' + targetIp,
          'Please check the address and try again.'
        ]);
        setIsRunning(false);
        return;
      }

      const target = nodes.find(n => 
        n.data.interfaces.some(i => i.ipAddress === targetIp)
      );

      if (!target) {
        setPingResult(['❌ Host unreachable']);
        setIsRunning(false);
        return;
      }

      // Spusť animaci paketu
      addPacket({
        id: `ping-${Date.now()}`,
        path: path,
        currentIndex: 0,
        type: 'ping'
      });

      // Simuluj ping
      const results = [];
      for (let i = 0; i < 4; i++) {
        const rtt = Math.floor(Math.random() * 30) + 10;
        results.push(`Reply from ${targetIp}: bytes=32 time=${rtt}ms TTL=${64 - path.length}`);
      }
      
      results.push('');
      results.push(`Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`);
      results.push(`Path: ${path.map(id => nodes.find(n => n.id === id)?.data.label).join(' → ')}`);

      setPingResult(results);
      setIsRunning(false);
    }, 1000);
  };

  const handleTraceroute = () => {
    setIsRunning(true);
    setPingResult([]);
    setTracerouteResult([]);
    clearPackets();

    setTimeout(() => {
      const path = findPath(sourceDevice, targetIp);
      
      if (!path) {
        setPingResult(['Traceroute failed: Destination unreachable']);
        setIsRunning(false);
        return;
      }

      // Spusť animaci paketu
      addPacket({
        id: `traceroute-${Date.now()}`,
        path: path,
        currentIndex: 0,
        type: 'traceroute'
      });

      // Simuluj traceroute s postupným zobrazením hopů
      const hops: Array<{ hop: number; device: string; ip: string; rtt: number }> = [];
      
      path.forEach((nodeId, index) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        const interface0 = node.data.interfaces[0];
        const ip = interface0?.ipAddress || 'N/A';
        const rtt = Math.floor(Math.random() * 20) + (index * 5) + 5;

        hops.push({
          hop: index + 1,
          device: node.data.label,
          ip: ip,
          rtt: rtt
        });
      });

      setTracerouteResult(hops);
      setIsRunning(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'linear-gradient(to bottom, #1e293b, #0f172a)',
      borderRadius: '10px',
      padding: '14px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      minWidth: '450px',
      maxWidth: '600px',
      zIndex: 1000,
    }}>
      <div style={{ 
        fontSize: '11px', 
        fontWeight: '700', 
        color: '#60a5fa',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🔧</span>
          <span>Network Tools</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '4px',
            color: '#fca5a5',
            cursor: 'pointer',
            padding: '4px 8px',
            fontSize: '9px',
            fontWeight: '600',
          }}
        >
          ✕ Zavřít
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        <select
          value={sourceDevice}
          onChange={(e) => setSourceDevice(e.target.value)}
          style={{
            flex: 1,
            padding: '6px 8px',
            borderRadius: '6px',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            fontSize: '9px',
          }}
        >
          <option value="">Vyberte zařízení...</option>
          {nodes.filter(n => n.data.type === 'pc' || n.data.type === 'server').map(node => (
            <option key={node.id} value={node.id} style={{ background: '#1e293b' }}>
              {node.data.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={targetIp}
          onChange={(e) => setTargetIp(e.target.value)}
          placeholder="Cílová IP (např. 192.168.1.10)"
          style={{
            flex: 1,
            padding: '6px 8px',
            borderRadius: '6px',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            fontSize: '9px',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
        <button
          onClick={handlePing}
          disabled={!sourceDevice || !targetIp || isRunning}
          style={{
            flex: 1,
            padding: '6px 10px',
            background: sourceDevice && targetIp && !isRunning ? '#10b981' : '#374151',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            fontSize: '9px',
            fontWeight: '600',
            cursor: sourceDevice && targetIp && !isRunning ? 'pointer' : 'not-allowed',
            opacity: sourceDevice && targetIp && !isRunning ? 1 : 0.5,
          }}
        >
          📡 Ping
        </button>

        <button
          onClick={handleTraceroute}
          disabled={!sourceDevice || !targetIp || isRunning}
          style={{
            flex: 1,
            padding: '6px 10px',
            background: sourceDevice && targetIp && !isRunning ? '#3b82f6' : '#374151',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            fontSize: '9px',
            fontWeight: '600',
            cursor: sourceDevice && targetIp && !isRunning ? 'pointer' : 'not-allowed',
            opacity: sourceDevice && targetIp && !isRunning ? 1 : 0.5,
          }}
        >
          🗺️ Traceroute
        </button>
      </div>

      {isRunning && (
        <div style={{
          padding: '10px',
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '6px',
          color: '#60a5fa',
          fontSize: '9px',
          textAlign: 'center',
        }}>
          ⏳ Zpracovávám...
        </div>
      )}

      {pingResult.length > 0 && (
        <div style={{
          background: '#0f172a',
          borderRadius: '6px',
          padding: '10px',
          fontFamily: 'monospace',
          fontSize: '8px',
          color: '#cbd5e1',
          maxHeight: '150px',
          overflowY: 'auto',
        }}>
          {pingResult.map((line, idx) => (
            <div key={idx} style={{ marginBottom: '3px' }}>
              {line}
            </div>
          ))}
        </div>
      )}

      {tracerouteResult.length > 0 && (
        <div style={{
          background: '#0f172a',
          borderRadius: '6px',
          padding: '10px',
          maxHeight: '150px',
          overflowY: 'auto',
        }}>
          <div style={{ 
            fontSize: '9px', 
            fontWeight: '600', 
            color: '#60a5fa', 
            marginBottom: '8px',
            fontFamily: 'monospace',
          }}>
            Tracing route to {targetIp}:
          </div>
          {tracerouteResult.map((hop) => (
            <div 
              key={hop.hop}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '4px 6px',
                background: 'rgba(59, 130, 246, 0.05)',
                borderRadius: '4px',
                marginBottom: '3px',
                fontSize: '8px',
                fontFamily: 'monospace',
                color: '#cbd5e1',
              }}
            >
              <span style={{ color: '#60a5fa', fontWeight: '600' }}>{hop.hop}</span>
              <span style={{ flex: 1, marginLeft: '10px' }}>{hop.device}</span>
              <span style={{ color: '#94a3b8' }}>{hop.ip}</span>
              <span style={{ color: '#10b981', marginLeft: '10px' }}>{hop.rtt}ms</span>
            </div>
          ))}
          <div style={{ 
            marginTop: '8px', 
            fontSize: '8px', 
            color: '#10b981',
            fontFamily: 'monospace',
          }}>
            ✓ Trace complete.
          </div>
        </div>
      )}
    </div>
  );
}
